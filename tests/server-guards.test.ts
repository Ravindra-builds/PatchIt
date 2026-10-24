import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeScreenshot } from '../lib/screenshot';
import { checkRateLimit, getClientKey, resetRateLimits } from '../lib/rate-limit';
import { GithubClient } from '../lib/github/client';
import { AppError } from '../lib/errors';

const isAppError = (code: string) => (err: unknown) => err instanceof AppError && err.code === code;

test('normalizeScreenshot: strips data URI prefix and keeps the mime type', () => {
  const result = normalizeScreenshot('data:image/png;base64,aGVsbG8=', 'image/png', 1024);
  assert.equal(result.data, 'aGVsbG8=');
  assert.equal(result.mimeType, 'image/png');
});

test('normalizeScreenshot: rejects mismatched mime, bad base64, and oversize images', () => {
  assert.throws(() => normalizeScreenshot('data:image/gif;base64,aGVsbG8=', undefined, 1024), isAppError('INVALID_INPUT'));
  assert.throws(() => normalizeScreenshot('data:image/jpeg;base64,aGVsbG8=', 'image/png', 1024), isAppError('INVALID_INPUT'));
  assert.throws(() => normalizeScreenshot('not base64!', 'image/png', 1024), isAppError('INVALID_INPUT'));
  assert.throws(() => normalizeScreenshot('aGVsbG8=', 'image/png', 4), isAppError('REQUEST_TOO_LARGE'));
});

test('checkRateLimit: blocks after the limit within one window and resets after it', () => {
  resetRateLimits();
  const now = 1_000_000;
  assert.equal(checkRateLimit('ip', 2, now).allowed, true);
  assert.equal(checkRateLimit('ip', 2, now).allowed, true);
  const blocked = checkRateLimit('ip', 2, now + 1000);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 59);
  assert.equal(checkRateLimit('other-ip', 2, now).allowed, true);
  assert.equal(checkRateLimit('ip', 2, now + 61_000).allowed, true);
});

test('getClientKey: uses the first x-forwarded-for entry', () => {
  assert.equal(getClientKey(new Headers({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' })), '1.2.3.4');
  assert.equal(getClientKey(new Headers()), 'unknown');
});

function withMockFetch(responder: (url: string) => Response, run: (urls: string[]) => Promise<void>) {
  const original = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    urls.push(url);
    return responder(url);
  }) as typeof fetch;
  return run(urls).finally(() => {
    globalThis.fetch = original;
  });
}

test('GithubClient: encodes file path segments', () =>
  withMockFetch(
    () => new Response('content', { status: 200 }),
    async (urls) => {
      const gh = new GithubClient({ token: undefined, timeoutMs: 1000 });
      await gh.getFileContent('o', 'r', 'main', 'src/a b#c?.ts');
      assert.match(urls[0], /\/contents\/src\/a%20b%23c%3F\.ts\?ref=main$/);
    }
  ));

test('GithubClient: missing README is null, but rate limits propagate', async () => {
  await withMockFetch(
    () => new Response('', { status: 404 }),
    async () => {
      assert.equal(await new GithubClient({ timeoutMs: 1000 }).getReadme('o', 'r'), null);
    }
  );
  await withMockFetch(
    () => new Response('', { status: 403, headers: { 'x-ratelimit-remaining': '0' } }),
    async () => {
      await assert.rejects(new GithubClient({ timeoutMs: 1000 }).getReadme('o', 'r'), isAppError('GITHUB_RATE_LIMITED'));
    }
  );
  await withMockFetch(
    () => new Response('', { status: 429 }),
    async () => {
      await assert.rejects(new GithubClient({ timeoutMs: 1000 }).getTree('o', 'r', 'main'), isAppError('GITHUB_RATE_LIMITED'));
    }
  );
});
