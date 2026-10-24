import { GithubClient } from './client';
import { extractKeywords, rankCandidateFiles } from './rank-files';
import { EvidencePacket, EvidenceItem } from '../../features/analysis/types';

const MAX_README_CHARS = 16 * 1024;
const MAX_SOURCE_FILE_CHARS = 12 * 1024;
const MAX_CANDIDATE_FILES = 5;
const MAX_TREE_SAMPLE = 80;
// Files above this size are skipped entirely instead of being downloaded and truncated.
const MAX_FETCHABLE_FILE_BYTES = 256 * 1024;
// Default total evidence size. ~36k chars is roughly 10-12k tokens, which keeps a whole request
// (plus system prompt and screenshot) under the Gemma free tier's 16k input tokens per minute.
const DEFAULT_MAX_EVIDENCE_CHARS = 36_000;

function truncate(text: string, maxChars: number) {
  return text.length > maxChars
    ? { content: text.slice(0, maxChars), truncated: true }
    : { content: text, truncated: false };
}

export async function collectEvidence(
  owner: string,
  repo: string,
  issueNumber: number,
  client?: GithubClient,
  maxEvidenceChars: number = DEFAULT_MAX_EVIDENCE_CHARS
): Promise<EvidencePacket> {
  const gh = client || new GithubClient();

  // Fetch repo & issue in parallel
  const [repoData, issueData] = await Promise.all([
    gh.getRepo(owner, repo),
    gh.getIssue(owner, repo, issueNumber),
  ]);

  // Fetch README and file tree in parallel
  const [readmeContent, tree] = await Promise.all([
    gh.getReadme(owner, repo),
    gh.getTree(owner, repo, repoData.defaultBranch),
  ]);

  const blobs = tree.entries.filter((entry) => entry.type === 'blob');
  const allTreePaths = blobs.map((entry) => entry.path);
  const fetchablePaths = blobs
    .filter((entry) => entry.size === undefined || entry.size <= MAX_FETCHABLE_FILE_BYTES)
    .map((entry) => entry.path);

  // Rank candidate source files based on issue keywords
  const keywords = extractKeywords(issueData.title, issueData.body);
  const candidatePaths = rankCandidateFiles(fetchablePaths, keywords, MAX_CANDIDATE_FILES);

  // Fetch candidate files in parallel
  const candidateFiles = await Promise.all(
    candidatePaths.map(async (filePath) => {
      const fileData = await gh.getFileContent(
        owner,
        repo,
        repoData.defaultBranch,
        filePath,
        MAX_SOURCE_FILE_CHARS
      );
      return {
        path: filePath,
        content: fileData.content,
        truncated: fileData.truncated,
      };
    })
  );

  const evidenceItems: EvidenceItem[] = [];
  // Everything below draws from one character budget so the prompt stays inside model quotas.
  let remainingChars = maxEvidenceChars;

  // 1. Issue evidence (at most a quarter of the budget; long issue threads otherwise crowd out code)
  const issueBody = truncate(issueData.body || 'No description provided.', Math.floor(maxEvidenceChars / 4));
  const issueContent = `Title: ${issueData.title}\nState: ${issueData.state}\nAuthor: ${issueData.author}\nLabels: ${issueData.labels.join(', ') || 'none'}\n\nDescription:\n${issueBody.content}`;
  remainingChars -= issueContent.length;
  evidenceItems.push({
    id: 'issue-details',
    kind: 'issue',
    title: `Issue #${issueData.number}: ${issueData.title}`,
    url: issueData.htmlUrl,
    content: issueContent,
    truncated: issueBody.truncated,
  });

  // 2. Tree overview evidence
  if (allTreePaths.length > 0) {
    const sampleTree = allTreePaths.slice(0, MAX_TREE_SAMPLE).join('\n');
    const totalLabel = tree.truncated ? `${allTreePaths.length}+` : `${allTreePaths.length}`;
    const treeContent = tree.truncated
      ? `${sampleTree}\n\n[Note: GitHub truncated the tree listing for this large repository; some files were not visible to the analysis.]`
      : sampleTree;
    remainingChars -= treeContent.length;
    evidenceItems.push({
      id: 'file-tree-sample',
      kind: 'file_tree',
      title: `File Tree Sample (${totalLabel} total files)`,
      url: `${repoData.htmlUrl}/tree/${repoData.defaultBranch}`,
      content: treeContent,
      truncated: tree.truncated || allTreePaths.length > MAX_TREE_SAMPLE,
    });
  }

  // 3. README evidence (if exists), capped at a fifth of the budget
  if (readmeContent && remainingChars > 0) {
    const readme = truncate(readmeContent, Math.min(MAX_README_CHARS, Math.floor(maxEvidenceChars / 5), remainingChars));
    remainingChars -= readme.content.length;
    evidenceItems.push({
      id: 'repo-readme',
      kind: 'readme',
      title: 'Repository README',
      url: `${repoData.htmlUrl}#readme`,
      content: readme.content,
      truncated: readme.truncated,
    });
  }

  // 4. Source files share what's left evenly; space a short file doesn't use carries to the next one.
  const filesWithContent = candidateFiles.filter(
    (file): file is typeof file & { content: string } => Boolean(file.content)
  );
  filesWithContent.forEach((file, index) => {
    const share = Math.floor(remainingChars / (filesWithContent.length - index));
    if (share <= 0) return;
    const source = truncate(file.content, share);
    remainingChars -= source.content.length;
    evidenceItems.push({
      id: `source-file-${index}`,
      kind: 'source_file',
      title: `File: ${file.path}`,
      url: `${repoData.htmlUrl}/blob/${repoData.defaultBranch}/${file.path}`,
      content: source.content,
      truncated: file.truncated || source.truncated,
      path: file.path,
    });
  });

  return {
    repository: repoData,
    issue: {
      number: issueData.number,
      title: issueData.title,
      body: issueData.body,
      state: issueData.state,
      labels: issueData.labels,
      htmlUrl: issueData.htmlUrl,
      author: issueData.author,
      createdAt: issueData.createdAt,
      repository: repoData,
    },
    evidenceItems,
    allTreePaths,
    treeTruncated: tree.truncated,
  };
}
