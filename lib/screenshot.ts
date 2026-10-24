import { AppError } from './errors';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const DATA_URI_PREFIX = /^data:([a-z]+\/[a-z0-9.+-]+);base64,/i;
const BASE64_BODY = /^[A-Za-z0-9+/]+={0,2}$/;

/**
 * Strips an optional data-URI prefix, checks the payload is real base64 of an allowed image type,
 * and enforces the decoded size limit.
 */
export function normalizeScreenshot(
  rawBase64: string,
  declaredMimeType: AllowedMimeType | undefined,
  maxBytes: number
): { data: string; mimeType: AllowedMimeType } {
  let data = rawBase64.trim();
  let mimeType: string | undefined = declaredMimeType;

  const prefix = data.match(DATA_URI_PREFIX);
  if (prefix) {
    const prefixMime = prefix[1].toLowerCase();
    if (declaredMimeType && prefixMime !== declaredMimeType) {
      throw new AppError('INVALID_INPUT', 'Screenshot type does not match its declared MIME type.');
    }
    mimeType = prefixMime;
    data = data.slice(prefix[0].length);
  }

  if (!mimeType || !(ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)) {
    throw new AppError('INVALID_INPUT', 'Screenshot must be a PNG, JPG, or WebP image.');
  }

  if (data.length === 0 || data.length % 4 !== 0 || !BASE64_BODY.test(data)) {
    throw new AppError('INVALID_INPUT', 'Screenshot data is not valid base64.');
  }

  const padding = data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0;
  const decodedBytes = (data.length / 4) * 3 - padding;
  if (decodedBytes > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    throw new AppError(
      'REQUEST_TOO_LARGE',
      `Screenshot exceeds the ${limitMb} MB limit. Please choose a smaller image.`,
      413
    );
  }

  return { data, mimeType: mimeType as AllowedMimeType };
}
