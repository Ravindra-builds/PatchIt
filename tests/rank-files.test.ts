import test from 'node:test';
import assert from 'node:assert/strict';
import { extractKeywords, rankCandidateFiles } from '../lib/github/rank-files';

test('extractKeywords: extracts high-frequency meaningful terms', () => {
  const title = 'Convert ReactFreshMultipleRenderer to createRoot';
  const body = 'ReactFreshMultipleRenderer still uses legacy ReactDOM.render instead of createRoot';

  const keywords = extractKeywords(title, body);

  assert.ok(keywords.includes('reactfreshmultiplerenderer') || keywords.includes('createroot'));
  assert.ok(!keywords.includes('the') && !keywords.includes('and'));
});

test('rankCandidateFiles: ranks matching files and excludes binary/node_modules', () => {
  const paths = [
    'node_modules/react/index.js',
    'dist/bundle.js',
    'packages/react-refresh/src/__tests__/ReactFreshMultipleRenderer-test.js',
    'packages/react-refresh/src/ReactFreshRuntime.js',
    'packages/react-dom/client.js',
    'packages/react/src/React.js',
    'docs/assets/logo.png',
  ];

  const keywords = ['reactfreshmultiplerenderer', 'refresh'];
  const ranked = rankCandidateFiles(paths, keywords, 2);

  assert.equal(ranked.length, 2);
  assert.equal(ranked[0], 'packages/react-refresh/src/__tests__/ReactFreshMultipleRenderer-test.js');
  assert.equal(ranked[1], 'packages/react-refresh/src/ReactFreshRuntime.js');
  assert.ok(!ranked.includes('node_modules/react/index.js'));
  assert.ok(!ranked.includes('docs/assets/logo.png'));
});
