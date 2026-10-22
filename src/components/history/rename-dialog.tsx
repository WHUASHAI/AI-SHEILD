"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  onRename: (newName: string) => void;
}

export default function RenameDialog({ isOpen, onClose, initialName, onRename }: RenameDialogProps) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Rename Scan</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <label htmlFor="scan-name" className="block text-sm font-medium text-gray-400 mb-2">
            Scan Name
          </label>
          <input
            id="scan-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-md text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            autoFocus
          />
        </div>
        
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-800 bg-gray-900/50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-transparent hover:bg-gray-800 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onRename(name)}
            disabled={!name.trim() || name === initialName}
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 rounded-md transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
