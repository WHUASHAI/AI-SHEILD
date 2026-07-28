'use client';

import React, { useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  acceptedTypes?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
  multiple?: boolean;
}

export function FileDropzone({
  onFilesAccepted,
  acceptedTypes,
  maxFiles = 1,
  maxSize = 50 * 1024 * 1024, // 50MB default
  className,
  multiple = false,
}: FileDropzoneProps) {
  const [files, setFiles] = useState<(File & { preview?: string })[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError(null);

    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File is too large. Max size is ${Math.round(maxSize / 1024 / 1024)}MB`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type');
      } else if (rejection.errors[0]?.code === 'too-many-files') {
        setError(`Too many files. Max is ${maxFiles}`);
      } else {
        setError(rejection.errors[0]?.message || 'Error uploading file');
      }
      return;
    }

    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      })
    );

    const updatedFiles = multiple ? [...files, ...newFiles].slice(0, maxFiles) : newFiles;
    setFiles(updatedFiles);
    onFilesAccepted(updatedFiles);
  };

  const removeFile = (fileToRemove: File, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFiles = files.filter((f) => f !== fileToRemove);
    setFiles(newFiles);
    onFilesAccepted(newFiles);
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxFiles,
    maxSize,
    multiple,
  });

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer min-h-[200px]',
          isDragActive
            ? 'border-cyan-500 bg-cyan-500/10'
            : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50',
          files.length > 0 && !multiple ? 'hidden' : ''
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className={cn("w-12 h-12 mb-4", isDragActive ? "text-cyan-500" : "text-slate-400")} />
        <p className="text-sm text-slate-300 font-medium mb-1">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here or click to browse'}
        </p>
        <p className="text-xs text-slate-500">
          Max size: {Math.round(maxSize / 1024 / 1024)}MB {maxFiles > 1 && `• Max files: ${maxFiles}`}
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 grid gap-3">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-slate-700 rounded-lg bg-slate-800/50">
              <div className="flex items-center space-x-3 overflow-hidden">
                {file.preview ? (
                  <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-slate-600 bg-slate-900">
                    <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded flex items-center justify-center bg-slate-700 flex-shrink-0">
                    <FileIcon className="w-5 h-5 text-slate-300" />
                  </div>
                )}
                <div className="truncate">
                  <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => removeFile(file, e)}
                className="text-slate-400 hover:text-red-400 hover:bg-red-400/10 flex-shrink-0 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
