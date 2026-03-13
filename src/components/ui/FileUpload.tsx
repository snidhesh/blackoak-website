'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  label?: string;
  error?: string;
  accept?: string;
  maxSize?: number;
  onChange: (file: File | null) => void;
}

export default function FileUpload({ label, error, accept = '.pdf,.doc,.docx', maxSize = 4 * 1024 * 1024, onChange }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    setFile(f);
    onChange(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          dragActive ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400',
          error && 'border-red-500'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">{file.name}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleFile(null); }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-600">Upload your CV (PDF/DOC)</p>
            <p className="text-xs text-gray-400">Max file size: {Math.round(maxSize / 1024 / 1024)}MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
