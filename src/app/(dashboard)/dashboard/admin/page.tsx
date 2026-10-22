"use client";

import React, { useState } from "react";
import { Users, Activity, HardDrive, ShieldAlert, AlertTriangle, Terminal, Play, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="p-6 min-h-screen bg-[#0a0f1e] text-gray-100 max-w-7xl mx-auto space-y-6">
      <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex items-center gap-3 text-red-400 mb-6">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium">This dashboard is restricted to platform administrators. High-privilege area.</p>
      </div>

      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Admin Control Center</h1>
          <p className="text-muted-foreground">Platform overview, user management, and system health.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card/50 border border-border p-5 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" /> Total Users
          </div>
          <p className="text-2xl font-bold text-foreground">12,450</p>
        </div>
        <div className="bg-card/50 border border-border p-5 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Activity className="w-4 h-4" /> Scans Today
          </div>
          <p className="text-2xl font-bold text-foreground">45,892</p>
        </div>
        <div className="bg-card/50 border border-border p-5 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Terminal className="w-4 h-4" /> Active Jobs
          </div>
          <p className="text-2xl font-bold text-foreground">124</p>
        </div>
        <div className="bg-card/50 border border-border p-5 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <HardDrive className="w-4 h-4" /> Storage Used
          </div>
          <p className="text-2xl font-bold text-foreground">2.4 TB</p>
        </div>
      </div>

      <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {["users", "scans", "queue", "failed", "api", "abuse"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap capitalize",
                activeTab === tab ? "border-cyan-500 text-cyan-400 bg-gray-800/30" : "border-transparent text-muted-foreground hover:text-gray-200 hover:bg-gray-800/10"
              )}
            >
              {tab === "queue" ? "Job Queue" : tab === "failed" ? "Failed Jobs" : tab === "api" ? "API Usage" : tab === "abuse" ? "Abuse Detection" : tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <input type="text" placeholder="Search users by email or ID..." className="bg-gray-950 border border-gray-700 rounded-md px-4 py-2 text-sm w-full max-w-md focus:border-cyan-500 focus:outline-none" />
              </div>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-gray-800/30 border-b border-border">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Scans</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr className="hover:bg-gray-800/20">
                    <td className="px-4 py-3 font-medium">test@originscan.ai</td>
                    <td className="px-4 py-3 text-cyan-400">Admin</td>
                    <td className="px-4 py-3 text-muted-foreground">1,204</td>
                    <td className="px-4 py-3"><span className="text-green-400 bg-green-900/20 px-2 py-0.5 rounded text-xs">Active</span></td>
                    <td className="px-4 py-3 text-right"><button className="text-muted-foreground hover:text-foreground">View</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "queue" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground mb-4">Active Processing Jobs</h3>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-gray-800/30 border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Job ID</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Started</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr className="hover:bg-gray-800/20">
                    <td className="px-4 py-3 font-mono text-muted-foreground">job_8f7d6e5</td>
                    <td className="px-4 py-3">Video Deepfake</td>
                    <td className="px-4 py-3 text-amber-400">Processing (45%)</td>
                    <td className="px-4 py-3 text-muted-foreground">2 mins ago</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-red-400 hover:text-red-300 flex items-center justify-end gap-1 ml-auto">
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab !== "users" && activeTab !== "queue" && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mb-4 opacity-20" />
              <p>Module content for {activeTab} goes here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
