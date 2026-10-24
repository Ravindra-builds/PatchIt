'use client';
import React, { useRef, useState } from 'react';
import { UploadCloud, X, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

export type AllowedMimeType = 'image/png' | 'image/jpeg' | 'image/webp';

interface ScreenshotPickerProps {
  onImageSelected: (base64: string | undefined, mimeType: AllowedMimeType | undefined) => void;
  maxSizeBytes?: number;
}

const ALLOWED_TYPES: AllowedMimeType[] = ['image/png', 'image/jpeg', 'image/webp'];

export function ScreenshotPicker({
  onImageSelected,
  maxSizeBytes = 5 * 1024 * 1024,
}: ScreenshotPickerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSizeMb = Math.round(maxSizeBytes / (1024 * 1024));

  const handleFile = (file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type as AllowedMimeType)) {
      setError('Please upload a PNG, JPG, or WebP screenshot.');
      return;
    }

    if (file.size > maxSizeBytes) {
      setError(`Image must be under ${maxSizeMb} MB in size.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(0) + ' KB');
      onImageSelected(result, file.type as AllowedMimeType);
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setFileName(null);
    setFileSize(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageSelected(undefined, undefined);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label htmlFor="screenshot-file" className="block text-sm font-medium text-fg">
          Error screenshot
        </label>
        <Badge variant="neutral">Optional</Badge>
      </div>

      <input
        id="screenshot-file"
        name="screenshot"
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {!preview ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload error screenshot"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="group flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong bg-subtle/50 px-4 py-4 text-center transition-colors hover:bg-subtle"
        >
          <UploadCloud className="h-4 w-4 text-muted transition-colors group-hover:text-fg" />
          <span className="text-sm text-muted">
            Drop screenshot here or <span className="font-medium text-fg underline underline-offset-4">browse</span>
          </span>
          <span className="text-xs text-faint">PNG, JPG or WebP, up to {maxSizeMb} MB</span>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-border bg-subtle p-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Screenshot preview"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 overflow-hidden text-left">
              <p className="max-w-[200px] truncate font-mono text-[13px] text-fg sm:max-w-xs">
                {fileName}
              </p>
              <p className="text-xs text-faint">{fileSize}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="cursor-pointer rounded-md p-1.5 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
            title="Remove screenshot"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-danger">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
