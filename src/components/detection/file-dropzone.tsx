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
    <div className={cn('w-full space-y-4', className)}>
      {/* Drop zone */}
      {!hasFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "relative rounded-3xl flex flex-col items-center justify-center min-h-[220px] p-8 cursor-pointer transition-all duration-500 overflow-hidden group border-2 border-dashed",
            isDragActive 
                ? "bg-cyan-azure/10 border-cyan-azure/50 shadow-palette-glow" 
                : "bg-space-cadet-dark/40 border-white/10 hover:bg-space-cadet-dark/60 hover:border-cyan-azure/30"
          )}
        >
          <input {...getInputProps()} />

          {/* Background glow on drag */}
          <div className={cn(
            "absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500",
            isDragActive ? "opacity-100" : "group-hover:opacity-40"
          )}
            style={{ background: 'radial-gradient(circle at center, rgba(78,122,177,0.15) 0%, transparent 70%)' }} />

          {/* Corner accents */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-azure/20 group-hover:border-cyan-azure/40 transition-colors" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-azure/20 group-hover:border-cyan-azure/40 transition-colors" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-azure/20 group-hover:border-cyan-azure/40 transition-colors" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-azure/20 group-hover:border-cyan-azure/40 transition-colors" />

          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 relative z-10',
            isDragActive ? 'scale-110 bg-cyan-azure/20' : 'bg-white/5 group-hover:bg-cyan-azure/10'
          )} style={{ border: '1px solid rgba(78,122,177,0.2)' }}>
            <UploadCloud className={cn('w-8 h-8 transition-colors duration-500', isDragActive ? 'text-cyan-azure' : 'text-air-sup-blue/40 group-hover:text-cyan-azure')} />
          </div>

          <p className="text-base font-bold text-foreground transition-colors relative z-10">
            {isDragActive ? 'Drop files now' : 'Drag & drop files here'}
          </p>
          <p className="text-xs font-medium text-air-sup-blue/40 mt-1 mb-4 relative z-10 uppercase tracking-[0.1em]">or click to browse local storage</p>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold text-ucla-blue uppercase tracking-widest bg-white/5 border border-white/5 relative z-10">
            MAX {formatBytes(maxSize)}{maxFiles > 1 ? ` · UP TO ${maxFiles} FILES` : ''}
          </div>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 p-4 rounded-2xl text-sm bg-destructive/10 border border-destructive/20 text-destructive shadow-palette-md"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <div className="space-y-2.5">
            {files.map((file, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-azure/20 hover:bg-white/10 transition-all shadow-palette-md"
              >
                {/* Preview or icon */}
                {file.preview ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:border-cyan-azure/30 transition-colors">
                    <img src={file.preview} alt="preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-space-cadet-dark/60 border border-white/5 group-hover:border-cyan-azure/30 transition-colors">
                    <FileIcon className="w-6 h-6 text-cyan-azure/60 group-hover:text-cyan-azure transition-colors" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate group-hover:text-cyan-azure-light transition-colors">{file.name}</p>
                  <p className="text-[10px] font-bold text-air-sup-blue/40 mt-1 uppercase tracking-widest">{formatBytes(file.size)}</p>
                </div>

                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                    <button onClick={(e) => remove(file, e)}
                    className="p-2 rounded-xl text-air-sup-blue/20 hover:text-rose-400 hover:bg-rose-400/10 transition-all shrink-0">
                    <X className="w-4 h-4" />
                    </button>
                </div>
              </motion.div>
            ))}

            {/* Add more (multiple mode) */}
            {multiple && files.length < maxFiles && (
              <div {...getRootProps()} className="flex items-center justify-center gap-3 p-4 rounded-2xl cursor-pointer transition-all text-xs font-bold text-air-sup-blue/40 uppercase tracking-widest hover:text-cyan-azure hover:bg-cyan-azure/5 border-2 border-dashed border-white/5 hover:border-cyan-azure/20">
                <input {...getInputProps()} />
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                    <UploadCloud className="w-4 h-4" />
                </div>
                Add more files ({files.length}/{maxFiles})
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
