"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language: "JavaScript" | "TypeScript" | "Python" | "cURL";
  tabs?: ("JavaScript" | "TypeScript" | "Python" | "cURL")[];
  onTabChange?: (tab: string) => void;
}

export default function CodeBlock({ code, language, tabs, onTabChange }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-800 bg-[#0d1117] my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800">
        {tabs ? (
          <div className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => onTabChange?.(tab)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  language === tab 
                    ? "bg-gray-800 text-gray-200" 
                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs font-medium text-gray-400">{language}</span>
        )}
        
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-md transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
