import { GithubClient } from './client';
import { extractKeywords, rankCandidateFiles } from './rank-files';
import { EvidencePacket, EvidenceItem } from '../../features/analysis/types';

const MAX_README_BYTES = 16 * 1024;
const MAX_SOURCE_FILE_BYTES = 12 * 1024;
const MAX_CANDIDATE_FILES = 5;

export async function collectEvidence(
  owner: string,
  repo: string,
  issueNumber: number,
  client?: GithubClient
): Promise<EvidencePacket> {
  const gh = client || new GithubClient();

  // Fetch repo & issue in parallel
  const [repoData, issueData] = await Promise.all([
    gh.getRepo(owner, repo),
    gh.getIssue(owner, repo, issueNumber),
  ]);

  // Fetch README and file tree in parallel
  const [readmeContent, treeEntries] = await Promise.all([
    gh.getReadme(owner, repo),
    gh.getTree(owner, repo, repoData.defaultBranch),
  ]);

  const allTreePaths = treeEntries
    .filter((entry) => entry.type === 'blob')
    .map((entry) => entry.path);

  // Rank candidate source files based on issue keywords
  const keywords = extractKeywords(issueData.title, issueData.body);
  const candidatePaths = rankCandidateFiles(allTreePaths, keywords, MAX_CANDIDATE_FILES);

  // Fetch candidate files in parallel
  const candidateFiles = await Promise.all(
    candidatePaths.map(async (filePath) => {
      const fileData = await gh.getFileContent(
        owner,
        repo,
        repoData.defaultBranch,
        filePath,
        MAX_SOURCE_FILE_BYTES
      );
      return {
        path: filePath,
        content: fileData.content,
        truncated: fileData.truncated,
      };
    })
  );

  const evidenceItems: EvidenceItem[] = [];

  // 1. Issue evidence
  evidenceItems.push({
    id: 'issue-details',
    kind: 'issue',
    title: `Issue #${issueData.number}: ${issueData.title}`,
    url: issueData.htmlUrl,
    content: `Title: ${issueData.title}\nState: ${issueData.state}\nAuthor: ${issueData.author}\nLabels: ${issueData.labels.join(', ') || 'none'}\n\nDescription:\n${issueData.body || 'No description provided.'}`,
    truncated: false,
  });

  // 2. README evidence (if exists)
  if (readmeContent) {
    const isTruncated = readmeContent.length > MAX_README_BYTES;
    evidenceItems.push({
      id: 'repo-readme',
      kind: 'readme',
      title: 'Repository README',
      url: `${repoData.htmlUrl}#readme`,
      content: isTruncated ? readmeContent.slice(0, MAX_README_BYTES) : readmeContent,
      truncated: isTruncated,
    });
  }

  // 3. Tree overview evidence (sample up to 100 paths)
  if (allTreePaths.length > 0) {
    const sampleTree = allTreePaths.slice(0, 80).join('\n');
    evidenceItems.push({
      id: 'file-tree-sample',
      kind: 'file_tree',
      title: `File Tree Sample (${allTreePaths.length} total files)`,
      url: `${repoData.htmlUrl}/tree/${repoData.defaultBranch}`,
      content: sampleTree,
      truncated: allTreePaths.length > 80,
    });
  }

  // 4. Source files
  candidateFiles.forEach((file, index) => {
    if (file.content) {
      evidenceItems.push({
        id: `source-file-${index}`,
        kind: 'source_file',
        title: `File: ${file.path}`,
        url: `${repoData.htmlUrl}/blob/${repoData.defaultBranch}/${file.path}`,
        content: file.content,
        truncated: file.truncated,
      });
    }
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
  };
}
