import { AnalysisResponse } from './types';

export const EXAMPLE_ISSUES = [
  {
    id: 'react-fresh-multiple-renderer',
    label: 'React #28000: Convert ReactFreshMultipleRenderer to createRoot',
    repoUrl: 'https://github.com/facebook/react',
    issueUrl: 'https://github.com/facebook/react/issues/28000',
  },
  {
    id: 'nextjs-image-loader',
    label: 'Next.js #58410: Custom loader path resolution with basePath',
    repoUrl: 'https://github.com/vercel/next.js',
    issueUrl: 'https://github.com/vercel/next.js/issues/58410',
  },
];

export const MOCK_ANALYSIS_RESPONSE: AnalysisResponse = {
  issue: {
    number: 28000,
    title: 'Convert ReactFreshMultipleRenderer to createRoot',
    body: 'ReactFreshMultipleRenderer still uses legacy ReactDOM.render instead of createRoot. This causes console warnings in React 18+ and fails in concurrent mode tests.',
    state: 'open',
    labels: ['Component: Fast Refresh', 'Difficulty: starter', 'Type: Refactor'],
    htmlUrl: 'https://github.com/facebook/react/issues/28000',
    author: 'gaearon',
    createdAt: '2024-01-15T18:22:10Z',
    repository: {
      owner: 'facebook',
      name: 'react',
      fullName: 'facebook/react',
      htmlUrl: 'https://github.com/facebook/react',
      description: 'The library for web and native user interfaces.',
      defaultBranch: 'main',
    },
  },
  plan: {
    issueSummary:
      'The Fast Refresh test harness helper `ReactFreshMultipleRenderer` still invokes deprecated `ReactDOM.render(...)`. The issue requests updating it to the modern `createRoot` API to eliminate React 18+ deprecation warnings and align with concurrent mode expectations.',
    suspectedArea: 'Fast Refresh testing utilities (packages/react-refresh & fixtures)',
    firstSteps: [
      {
        title: 'Locate ReactFreshMultipleRenderer test helper',
        explanation:
          'Inspect packages/react-refresh/src/__tests__/ReactFreshMultipleRenderer-test.js to observe how the renderer root is initialized and torn down between Fast Refresh cycles.',
        evidenceIds: ['file-packages-react-refresh-test'],
        verification: 'verified',
      },
      {
        title: 'Check createRoot migration patterns in adjacent tests',
        explanation:
          'Search how sibling test suites in packages/react-dom/src/__tests__ create roots using `ReactDOMClient.createRoot` or `ReactTestUtils` to ensure consistent teardown via `root.unmount()`.',
        evidenceIds: ['file-tree'],
        verification: 'verified',
      },
      {
        title: 'Run Fast Refresh unit tests locally',
        explanation:
          'Execute the Jest test suite targeting react-refresh to verify existing failures or deprecation warnings before altering the render call.',
        evidenceIds: ['readme'],
        verification: 'needs_verification',
      },
    ],
    relevantFiles: [
      {
        path: 'packages/react-refresh/src/__tests__/ReactFreshMultipleRenderer-test.js',
        reason:
          'Contains the direct test suite referencing ReactFreshMultipleRenderer and legacy ReactDOM.render assertions.',
        githubUrl:
          'https://github.com/facebook/react/blob/main/packages/react-refresh/src/__tests__/ReactFreshMultipleRenderer-test.js',
        evidenceIds: ['file-packages-react-refresh-test'],
        confidence: 'high',
      },
      {
        path: 'packages/react-refresh/src/ReactFreshRuntime.js',
        reason:
          'Core Fast Refresh runtime logic; verify whether modifying the renderer harness impacts runtime registration hook signatures.',
        githubUrl:
          'https://github.com/facebook/react/blob/main/packages/react-refresh/src/ReactFreshRuntime.js',
        evidenceIds: ['file-tree'],
        confidence: 'medium',
      },
      {
        path: 'packages/react-dom/client.js',
        reason:
          'Exports `createRoot` API entry point used for React 18+ client rendering initialization.',
        githubUrl: 'https://github.com/facebook/react/blob/main/packages/react-dom/client.js',
        evidenceIds: ['file-tree'],
        confidence: 'medium',
      },
    ],
    reproduction: [
      {
        instruction: 'yarn test packages/react-refresh',
        source: 'README.md',
        verification: 'documented',
      },
      {
        instruction: 'yarn build --type=UMD react-refresh',
        source: null,
        verification: 'suggested',
      },
    ],
    openQuestions: [
      'Does ReactFreshMultipleRenderer need to support older React versions where `createRoot` is unavailable, or is this test helper strictly modern-only?',
      'Is asynchronous unmounting required when switching to `root.unmount()`, requiring an `act()` wrapper around test cleanup?',
    ],
    limitations: [
      'Cannot execute repository yarn scripts in the current environment.',
      'Only sampled top matching files in packages/react-refresh; internal build scripts were not fully indexed.',
    ],
  },
  evidenceSummary: {
    fileCount: 4,
    hasReadme: true,
    treeTotalFiles: 7909,
    analyzedFiles: [
      'packages/react-refresh/src/__tests__/ReactFreshMultipleRenderer-test.js',
      'packages/react-refresh/src/ReactFreshRuntime.js',
      'packages/react-dom/client.js',
      'README.md',
    ],
  },
  modelUsed: 'gemma-4-26b-a4b-it',
};
