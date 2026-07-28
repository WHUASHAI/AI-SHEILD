"use client";

import React, { useState } from "react";
import { Users, Settings, Activity, Shield, Mail, MoreVertical, Trash2, Edit2, Copy, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_MEMBERS = [
  { id: "1", name: "Jane Doe", email: "jane@example.com", role: "Owner", joined: "Oct 1, 2023", active: "2 hrs ago" },
  { id: "2", name: "John Smith", email: "john@example.com", role: "Admin", joined: "Oct 5, 2023", active: "1 day ago" },
  { id: "3", name: "Alice Johnson", email: "alice@example.com", role: "Analyst", joined: "Oct 12, 2023", active: "4 days ago" },
  { id: "4", name: "Bob Williams", email: "bob@example.com", role: "Viewer", joined: "Nov 2, 2023", active: "1 week ago" },
];

export default function TeamPage() {
  const [hasWorkspace, setHasWorkspace] = useState(true);
  const [activeTab, setActiveTab] = useState("members");
  
  if (!hasWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="w-16 h-16 bg-cyan-900/30 rounded-full flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Create Your Team Workspace</h1>
        <p className="text-gray-400 max-w-md mb-8">Collaborate with your team, share scan reports, and manage API access together. Completely free for up to 25 members.</p>
        <button 
          onClick={() => setHasWorkspace(true)}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-md transition-colors"
        >
          Create Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-[#0a0f1e] text-gray-100 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Acme Corp Workspace</h1>
          <p className="text-gray-400">Team workspaces are free. Reasonable limits apply for platform stability.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 hover:bg-gray-800 rounded-md transition-colors text-sm font-medium">
          <Settings className="w-4 h-4" /> Workspace Settings
        </button>
      </div>

      <div className="flex border-b border-gray-800">
        <button 
          onClick={() => setActiveTab("members")}
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "members" ? "border-cyan-500 text-cyan-400" : "border-transparent text-gray-400 hover:text-gray-200"
          )}
        >
          Members
        </button>
        <button 
          onClick={() => setActiveTab("activity")}
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "activity" ? "border-cyan-500 text-cyan-400" : "border-transparent text-gray-400 hover:text-gray-200"
          )}
        >
          Activity
        </button>
        <button 
          onClick={() => setActiveTab("settings")}
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "settings" ? "border-cyan-500 text-cyan-400" : "border-transparent text-gray-400 hover:text-gray-200"
          )}
        >
          Settings
        </button>
      </div>

      {activeTab === "members" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Invite Team Member</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="colleague@company.com" 
                className="flex-1 bg-gray-950 border border-gray-700 rounded-md px-4 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500"
              />
              <select className="bg-gray-950 border border-gray-700 rounded-md px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500">
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
                <option value="reviewer">Reviewer</option>
                <option value="viewer">Viewer</option>
              </select>
              <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-md transition-colors text-sm whitespace-nowrap flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" /> Send Invite
              </button>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
              <h2 className="text-lg font-semibold text-white">Team Members</h2>
              <span className="text-xs font-medium text-cyan-400 bg-cyan-900/20 px-3 py-1 rounded-full border border-cyan-800/30">
                4 of 25 seats used
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-800/30 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Member</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                    <th className="px-6 py-4 font-medium">Last Active</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {MOCK_MEMBERS.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-900 text-cyan-300 flex items-center justify-center font-bold text-xs border border-cyan-800">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-200">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                          member.role === 'Owner' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                          member.role === 'Admin' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                          "bg-gray-800 text-gray-300 border-gray-700"
                        )}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{member.joined}</td>
                      <td className="px-6 py-4 text-gray-400">{member.active}</td>
                      <td className="px-6 py-4 text-right">
                        {member.role !== 'Owner' && (
                          <button className="p-1.5 text-gray-400 hover:text-red-400 rounded-md transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/30 border border-gray-800 p-5 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-500" /> Roles & Permissions
              </h3>
              <ul className="space-y-3 text-sm">
                <li><strong className="text-gray-300">Owner:</strong> <span className="text-gray-500">Full access, settings, member management.</span></li>
                <li><strong className="text-gray-300">Admin:</strong> <span className="text-gray-500">Manage members, view all scans.</span></li>
                <li><strong className="text-gray-300">Analyst:</strong> <span className="text-gray-500">Create scans, view results.</span></li>
                <li><strong className="text-gray-300">Reviewer:</strong> <span className="text-gray-500">View scans and reports only.</span></li>
                <li><strong className="text-gray-300">Viewer:</strong> <span className="text-gray-500">View explicitly shared reports.</span></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Activity and Settings tabs would go here */}
      {activeTab === "settings" && (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">General Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Workspace Name</label>
                <input 
                  type="text" 
                  defaultValue="Acme Corp" 
                  className="w-full bg-gray-950 border border-gray-700 rounded-md px-4 py-2 text-sm text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Workspace Slug (URL)</label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-700 bg-gray-900 text-gray-500 sm:text-sm">
                    originscan.ai/
                  </span>
                  <input 
                    type="text" 
                    defaultValue="acme-corp" 
                    className="flex-1 bg-gray-950 border border-gray-700 rounded-r-md px-4 py-2 text-sm text-gray-100"
                  />
                </div>
              </div>
              
              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-md transition-colors text-sm">
                Save Changes
              </button>
            </div>
          </div>
          
          <div className="border border-red-900/50 bg-red-950/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Danger Zone
            </h2>
            <p className="text-sm text-gray-400 mb-4">Once you delete a workspace, there is no going back. Please be certain.</p>
            <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium border border-red-500/30 rounded-md transition-colors text-sm">
              Delete Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
