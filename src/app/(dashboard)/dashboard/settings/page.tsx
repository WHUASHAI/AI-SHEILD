'use client';

import { useState } from 'react';
import { User, Lock, Bell, Shield, Palette, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'profile' | 'security' | 'notifications' | 'privacy' | 'appearance';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account preferences and settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-[#1f2937] text-white"
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#1f2937]/50"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#111827] border border-[#1f2937] rounded-xl p-6 min-h-[500px]">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-lg font-medium text-white border-b border-[#1f2937] pb-4">Profile Information</h2>
              
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#06b6d4] to-[#3b82f6] flex items-center justify-center text-white text-2xl font-bold">
                  JD
                </div>
                <div>
                  <button className="px-4 py-2 bg-[#1f2937] hover:bg-[#374151] text-white text-sm font-medium rounded-md transition-colors">
                    Change Avatar
                  </button>
                  <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">First Name</label>
                  <input type="text" defaultValue="John" className="w-full bg-[#0a0f1e] border border-[#1f2937] text-white rounded-md px-3 py-2 focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4] outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Last Name</label>
                  <input type="text" defaultValue="Doe" className="w-full bg-[#0a0f1e] border border-[#1f2937] text-white rounded-md px-3 py-2 focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4] outline-none transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-300">Email Address</label>
                  <input type="email" defaultValue="john@example.com" className="w-full bg-[#0a0f1e] border border-[#1f2937] text-white rounded-md px-3 py-2 focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4] outline-none transition-all" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-lg font-medium text-white border-b border-[#1f2937] pb-4">Security Settings</h2>
              
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-[#0a0f1e] border border-[#1f2937] text-white rounded-md px-3 py-2 focus:ring-1 focus:ring-[#06b6d4] outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-[#0a0f1e] border border-[#1f2937] text-white rounded-md px-3 py-2 focus:ring-1 focus:ring-[#06b6d4] outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-[#0a0f1e] border border-[#1f2937] text-white rounded-md px-3 py-2 focus:ring-1 focus:ring-[#06b6d4] outline-none transition-all" />
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-[#1f2937]">
                <h3 className="text-md font-medium text-white mb-4">Active Sessions</h3>
                <div className="bg-[#0a0f1e] rounded-lg p-4 border border-[#1f2937] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Windows PC - Chrome</p>
                    <p className="text-xs text-emerald-400 mt-1">Current Session • Active now</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-lg font-medium text-white border-b border-[#1f2937] pb-4">Email Notifications</h2>
              
              <div className="space-y-4">
                {[
                  { title: 'Scan Completions', desc: 'Get notified when a large batch scan finishes.' },
                  { title: 'Security Alerts', desc: 'Get notified about unrecognized logins.' },
                  { title: 'Team Activity', desc: 'When team members join or share reports.' },
                  { title: 'Product Updates', desc: 'News about new detectors and features.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between py-3 border-b border-[#1f2937]/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#06b6d4]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-lg font-medium text-white border-b border-[#1f2937] pb-4">Privacy & Data</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Data Retention</h3>
                  <select className="w-full max-w-xs bg-[#0a0f1e] border border-[#1f2937] text-white rounded-md px-3 py-2 focus:ring-1 focus:ring-[#06b6d4] outline-none">
                    <option>Keep scans forever</option>
                    <option>Auto-delete after 30 days</option>
                    <option>Auto-delete after 7 days</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">Choose how long AI Shield stores your scan history.</p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#1f2937]">
                  <h3 className="text-sm font-medium text-rose-400 mb-2">Danger Zone</h3>
                  <p className="text-xs text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <button className="px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-md text-sm font-medium hover:bg-rose-500/20 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-lg font-medium text-white border-b border-[#1f2937] pb-4">Appearance</h2>
              
              <div>
                <h3 className="text-sm font-medium text-white mb-4">Theme Preference</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border-2 border-[#06b6d4] bg-[#0a0f1e] rounded-xl p-4 cursor-pointer relative overflow-hidden">
                    <div className="absolute top-2 right-2 w-4 h-4 bg-[#06b6d4] rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#0a0f1e] rounded-full" />
                    </div>
                    <div className="w-full h-20 bg-[#111827] rounded-md border border-[#1f2937] mb-3 flex flex-col gap-2 p-2">
                      <div className="w-full h-3 bg-[#1f2937] rounded" />
                      <div className="w-2/3 h-3 bg-[#1f2937] rounded" />
                    </div>
                    <p className="text-sm font-medium text-center text-white">Dark Theme</p>
                  </div>
                  
                  <div className="border-2 border-[#1f2937] bg-white rounded-xl p-4 cursor-not-allowed opacity-50 relative overflow-hidden">
                    <div className="w-full h-20 bg-gray-100 rounded-md border border-gray-200 mb-3 flex flex-col gap-2 p-2">
                      <div className="w-full h-3 bg-gray-200 rounded" />
                      <div className="w-2/3 h-3 bg-gray-200 rounded" />
                    </div>
                    <p className="text-sm font-medium text-center text-gray-900">Light Theme (Soon)</p>
                  </div>
                  
                  <div className="border-2 border-[#1f2937] bg-gradient-to-r from-[#0a0f1e] to-white rounded-xl p-4 cursor-not-allowed opacity-50 relative overflow-hidden">
                    <div className="w-full h-20 flex mb-3">
                       <div className="flex-1 bg-[#111827] rounded-l-md border-y border-l border-[#1f2937] p-2">
                         <div className="w-full h-3 bg-[#1f2937] rounded mb-2" />
                       </div>
                       <div className="flex-1 bg-gray-100 rounded-r-md border-y border-r border-gray-200 p-2">
                         <div className="w-full h-3 bg-gray-200 rounded mb-2" />
                       </div>
                    </div>
                    <p className="text-sm font-medium text-center text-gray-400">System (Soon)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
