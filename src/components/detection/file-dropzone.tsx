'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  acceptedTypes?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  multiple?: boolean;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileDropzone({
  onFilesAccepted,
  acceptedTypes,
  maxFiles = 1,
  maxSize = 50 * 1024 * 1024,
  className,
  multiple = false,
}: FileDropzoneProps) {
  const [files, setFiles] = useState<(File & { preview?: string })[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejections: FileRejection[]) => {
    setError(null);
    if (rejections.length > 0) {
      const code = rejections[0].errors[0]?.code;
      if (code === 'file-too-large')    setError(`File too large. Max: ${formatBytes(maxSize)}`);
      else if (code === 'file-invalid-type') setError('Invalid file type.');
      else if (code === 'too-many-files')    setError(`Too many files. Max: ${maxFiles}`);
      else setError(rejections[0].errors[0]?.message ?? 'Upload error.');
      return;
    }
    const withPreviews = acceptedFiles.map(f =>
      Object.assign(f, { preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined })
    );
    const updated = multiple ? [...files, ...withPreviews].slice(0, maxFiles) : withPreviews;
    setFiles(updated);
    onFilesAccepted(updated);
  }, [files, maxFiles, maxSize, multiple, onFilesAccepted]);

  const remove = (target: File, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = files.filter(f => f !== target);
    setFiles(next);
    onFilesAccepted(next);
    if ((target as any).preview) URL.revokeObjectURL((target as any).preview);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: acceptedTypes, maxFiles, maxSize, multiple,
  });

  const hasFiles = files.length > 0 && !multiple;

  return (
    <div className={cn('w-full space-y-3', className)}>
      {/* Drop zone */}
      {!hasFiles && (
        <div
          {...getRootProps()}
          className="relative rounded-2xl flex flex-col items-center justify-center min-h-[200px] p-8 cursor-pointer transition-all duration-300 overflow-hidden group"
          style={{
            background: isDragActive ? 'rgba(78,122,177,0.12)' : 'rgba(0,0,0,0.2)',
            border: isDragActive ? '2px dashed rgba(78,122,177,0.7)' : '2px dashed rgba(78,122,177,0.2)',
            boxShadow: isDragActive ? '0 0 0 4px rgba(78,122,177,0.12), inset 0 0 40px rgba(78,122,177,0.08)' : 'none',
          }}
        >
          <input {...getInputProps()} />

          {/* Background glow on drag */}
          {isDragActive && (
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(78,122,177,0.15) 0%, transparent 70%)' }} />
          )}

          {/* Subtle corner dots */}
          {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map(pos => (
            <span key={pos} className={`absolute ${pos} w-1.5 h-1.5 rounded-full`}
              style={{ background: 'rgba(78,122,177,0.4)' }} />
          ))}

          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300',
            isDragActive ? 'scale-110' : 'group-hover:scale-105'
          )} style={{ background: 'rgba(78,122,177,0.12)', border: '1px solid rgba(78,122,177,0.3)' }}>
            <UploadCloud className={cn('w-7 h-7 transition-colors', isDragActive ? 'text-cyan-azure' : 'text-air-sup-blue/60 group-hover:text-air-sup-blue')} />
          </div>

          <p className="text-sm font-medium text-foreground/80 mb-1">
            {isDragActive ? 'Drop to upload' : 'Drag & drop files here'}
          </p>
          <p className="text-xs text-air-sup-blue/50 mb-3">or click to browse</p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-air-sup-blue/50"
            style={{ background: 'rgba(78,122,177,0.07)', border: '1px solid rgba(78,122,177,0.15)' }}>
            Max {formatBytes(maxSize)}{maxFiles > 1 ? ` · Up to ${maxFiles} files` : ''}
          </div>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2.5 p-3 rounded-xl text-sm"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-rose-400">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.97, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 6 }}
                transition={{ duration: 0.2 }}
                className="group flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(78,122,177,0.08)', border: '1px solid rgba(78,122,177,0.2)' }}
              >
                {/* Preview or icon */}
                {file.preview ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-cyan-azure/20">
                    <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(78,122,177,0.15)', border: '1px solid rgba(78,122,177,0.25)' }}>
                    <FileIcon className="w-5 h-5 text-cyan-azure/70" />
                  </div>
                )}

                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-air-sup-blue/50 mt-0.5">{formatBytes(file.size)}</p>
                </div>

                <CheckCircle2 className="w-4 h-4 text-emerald-400/70 shrink-0" />

                <button onClick={(e) => remove(file, e)}
                  className="p-1.5 rounded-lg text-air-sup-blue/40 hover:text-rose-400 hover:bg-rose-400/10 transition-colors shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}

            {/* Add more (multiple mode) */}
            {multiple && files.length < maxFiles && (
              <div {...getRootProps()} className="flex items-center justify-center gap-2 p-2.5 rounded-xl cursor-pointer transition-colors text-xs text-air-sup-blue/50 hover:text-air-sup-blue hover:bg-cyan-azure/5"
                style={{ border: '1px dashed rgba(78,122,177,0.2)' }}>
                <input {...getInputProps()} />
                <UploadCloud className="w-3.5 h-3.5" />
                Add more files ({files.length}/{maxFiles})
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
