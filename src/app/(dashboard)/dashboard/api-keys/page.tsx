"use client";

import React, { useState } from "react";
import { Key, Copy, Eye, EyeOff, RefreshCw, Trash2, Plus, Server, Activity, Clock, Search, BookOpen, AlertCircle, Terminal } from "lucide-react";
import CodeBlock from "@/components/api/code-block";

const MOCK_KEYS = [
  { id: "key_1", name: "Production App", prefix: "os_prod_", lastUsed: "2 mins ago", requests: 12450, status: "active" },
  { id: "key_2", name: "Testing Env", prefix: "os_test_", lastUsed: "3 days ago", requests: 342, status: "active" },
  { id: "key_3", name: "Old Integration", prefix: "os_dev_", lastUsed: "2 months ago", requests: 8900, status: "revoked" },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState(MOCK_KEYS);
  const [newKey, setNewKey] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("JavaScript");

  const handleCreateKey = () => {
    if (!newKey.trim()) return;
    const generatedKey = `os_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setKeys([
      { id: Date.now().toString(), name: newKey, prefix: "os_live_", lastUsed: "Never", requests: 0, status: "active" },
      ...keys
    ]);
    setShowNewKey(generatedKey);
    setNewKey("");
  };

  const codeExample = `// Text Analysis Example
const response = await fetch('https://api.originscan.ai/v1/analyze/text', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_api_key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Content to analyze...',
    options: { language: 'en' }
  })
});

const result = await response.json();
console.log(result.result); // 'Likely AI-Generated'`;

  return (
    <div className="p-6 min-h-screen bg-[#0a0f1e] text-gray-100 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">API Keys & Access</h1>
          <p className="text-gray-400">Free API access for all users. Rate limits apply to prevent abuse.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 hover:bg-gray-800 rounded-md transition-colors text-sm font-medium">
            <BookOpen className="w-4 h-4" /> View Documentation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-xl">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Hourly Limit</h3>
          <p className="text-2xl font-bold text-white">100 <span className="text-sm font-normal text-gray-500">reqs/hr</span></p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-xl">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Daily Limit</h3>
          <p className="text-2xl font-bold text-white">1,000 <span className="text-sm font-normal text-gray-500">reqs/day</span></p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-xl">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Monthly Limit</h3>
          <p className="text-2xl font-bold text-white">10,000 <span className="text-sm font-normal text-gray-500">reqs/mo</span></p>
        </div>
        <div className="bg-cyan-900/10 border border-cyan-800/30 p-5 rounded-xl flex flex-col justify-center">
          <h3 className="text-sm font-medium text-cyan-400 mb-1 flex items-center gap-1.5">
            <Check className="w-4 h-4" /> 100% Free Tier
          </h3>
          <p className="text-xs text-gray-400">No credit card required. All features included.</p>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Create New API Key</h2>
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="e.g., Python Script, Zapier Integration" 
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="flex-1 max-w-md bg-gray-950 border border-gray-700 rounded-md px-4 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <button 
              onClick={handleCreateKey}
              disabled={!newKey.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium rounded-md transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Create Key
            </button>
          </div>

          {showNewKey && (
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-3">
                  <h3 className="text-sm font-medium text-amber-500">Store this key securely!</h3>
                  <p className="text-sm text-amber-500/80">For security reasons, it will not be shown again. If you lose it, you will need to generate a new one.</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={showNewKey}
                      className="flex-1 bg-black/40 border border-amber-500/30 rounded-md px-3 py-2 text-sm font-mono text-amber-400 focus:outline-none selection:bg-amber-500/30"
                    />
                    <button 
                      onClick={() => navigator.clipboard.writeText(showNewKey)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium rounded-md transition-colors text-sm"
                    >
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                  </div>
                  <button onClick={() => setShowNewKey(null)} className="text-sm text-gray-400 hover:text-white underline underline-offset-2">
                    I have saved this key
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-800/30 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Key Prefix</th>
                <th className="px-6 py-4 font-medium">Last Used</th>
                <th className="px-6 py-4 font-medium">Requests</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {keys.map((key) => (
                <tr key={key.id} className={`hover:bg-gray-800/20 transition-colors ${key.status === 'revoked' ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 font-medium text-gray-200">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-500" />
                      <span className={key.status === 'revoked' ? 'line-through' : ''}>{key.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-400">{key.prefix}••••••••</td>
                  <td className="px-6 py-4 text-gray-400">{key.lastUsed}</td>
                  <td className="px-6 py-4 text-gray-400">{key.requests.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {key.status === 'active' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Revoked</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      disabled={key.status === 'revoked'}
                      className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-gray-400" /> API Documentation
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-200">Text Analysis Endpoint</h3>
            <p className="text-sm text-gray-400">Analyze text for AI generation, editing, or enhancement.</p>
            <div className="flex items-center gap-2 text-sm font-mono bg-gray-950 p-3 rounded-lg border border-gray-800">
              <span className="text-cyan-400 font-bold">POST</span>
              <span className="text-gray-300">https://api.originscan.ai/v1/analyze/text</span>
            </div>
            
            <CodeBlock 
              code={codeExample} 
              language={activeTab as any} 
              tabs={["JavaScript", "TypeScript", "Python", "cURL"]}
              onTabChange={setActiveTab}
            />
            
            <div className="mt-4 p-4 bg-gray-950 border border-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Example Response</h4>
              <pre className="text-xs font-mono text-gray-400 overflow-x-auto">
{`{
  "scanId": "scan_123456789",
  "status": "completed",
  "result": "Likely AI-Generated",
  "confidence": 85,
  "overallScore": 85,
  "signals": [
    { "name": "High Sentence Uniformity", "score": 0.82 }
  ],
  "disclaimer": "AI Sheild provides a probability-based analysis. Results may contain false positives or false negatives."
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
