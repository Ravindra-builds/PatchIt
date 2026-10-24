/**
 * Simple, robust path ranking heuristics based on issue keywords.
 */

const EXCLUDED_DIRS = [
  'node_modules/',
  '.next/',
  '.git/',
  'dist/',
  'build/',
  'coverage/',
  'out/',
  'vendor/',
  '.turbo/',
  'target/',
  '.cache/',
];

const BINARY_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.svg',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.mp4',
  '.mov',
  '.webm',
  '.exe',
  '.dll',
  '.dylib',
  '.so',
  '.bin',
  '.lock',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
];

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'he',
  'in',
  'is',
  'it',
  'its',
  'of',
  'on',
  'that',
  'the',
  'to',
  'was',
  'were',
  'will',
  'with',
  'this',
  'issue',
  'bug',
  'fix',
  'error',
  'problem',
  'fail',
  'fails',
  'failed',
  'not',
  'when',
  'using',
  'should',
  'would',
  'could',
  'can',
  'please',
  'help',
  'does',
  'doesn',
]);

export function extractKeywords(title: string, body: string): string[] {
  const combined = `${title} ${body}`;
  const tokens = combined.match(/[a-zA-Z0-9_-]{3,}/g) || [];
  const freqMap = new Map<string, number>();

  for (const raw of tokens) {
    const token = raw.toLowerCase();
    if (STOPWORDS.has(token)) continue;
    if (/^\d+$/.test(token)) continue;

    freqMap.set(token, (freqMap.get(token) || 0) + 1);

    const subParts = raw
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(/[^a-zA-Z0-9]/)
      .map((p) => p.toLowerCase())
      .filter((p) => p.length >= 3 && !STOPWORDS.has(p));

    for (const part of subParts) {
      freqMap.set(part, (freqMap.get(part) || 0) + 1);
    }
  }

  return Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 30);
}

export function rankCandidateFiles(
  allPaths: string[],
  keywords: string[],
  limit = 5
): string[] {
  const scoredFiles: { path: string; score: number }[] = [];

  for (const path of allPaths) {
    const lowerPath = path.toLowerCase();

    if (EXCLUDED_DIRS.some((dir) => lowerPath.includes(dir))) continue;
    if (BINARY_EXTENSIONS.some((ext) => lowerPath.endsWith(ext))) continue;

    let score = 0;
    const filename = lowerPath.split('/').pop() || '';

    for (const keyword of keywords) {
      if (filename.includes(keyword)) {
        score += 10;
      } else if (lowerPath.includes(keyword)) {
        score += 3;
      }
    }

    if (score > 0) {
      if (lowerPath.includes('src/') || lowerPath.includes('lib/')) {
        score += 1;
      }
      if (lowerPath.includes('test') || lowerPath.includes('spec')) {
        score += 1;
      }
      scoredFiles.push({ path, score });
    }
  }

  scoredFiles.sort((a, b) => b.score - a.score);

  return scoredFiles.slice(0, limit).map((f) => f.path);
}
