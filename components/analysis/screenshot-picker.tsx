'use client';
import React, { useRef, useState } from 'react';
import { UploadCloud, X, AlertCircle } from 'lucide-react';

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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="screenshot-file" className="block text-xs font-medium text-[#9BAABD]">
          Optional: Error screenshot
        </label>
        <span className="text-[11px] text-[#9BAABD]/70">PNG, JPG or WebP (max {maxSizeMb} MB)</span>
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
          className="border border-dashed border-[#273548] hover:border-[#48C9A4]/50 bg-[#172233]/40 hover:bg-[#172233]/80 rounded-lg p-3 text-center cursor-pointer transition-colors flex items-center justify-center gap-3 group"
        >
          <UploadCloud className="w-5 h-5 text-[#9BAABD] group-hover:text-[#48C9A4] transition-colors" />
          <span className="text-xs text-[#9BAABD] group-hover:text-[#E6EDF5] transition-colors">
            Drop screenshot here or <span className="text-[#48C9A4] underline">browse</span>
          </span>
        </div>
      ) : (
        <div className="bg-[#172233] border border-[#273548] rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-[#273548] overflow-hidden bg-black/40 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Screenshot preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-mono text-[#E6EDF5] truncate max-w-[200px] sm:max-w-xs">
                {fileName}
              </p>
              <p className="text-[11px] text-[#9BAABD]">{fileSize}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-[#9BAABD] hover:text-[#F08080] p-1.5 rounded-md hover:bg-[#111A27] transition-colors cursor-pointer"
            title="Remove screenshot"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-[#F08080] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
