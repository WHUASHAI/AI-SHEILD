'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Bell, Shield, Palette, Save, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'notifications' | 'privacy' | 'appearance';

const tabs = [
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Manage your email and alert preferences' },
  { id: 'privacy', label: 'Privacy & Data', icon: Shield, desc: 'Control your scan history and data retention' },
  { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Customize the look and feel of the platform' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('notifications');

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-air-sup-blue/70 text-sm mt-1.5">Manage your account preferences and system configuration.</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:w-72 shrink-0"
        >
          <nav className="flex lg:flex-col gap-2 p-1 rounded-2xl bg-space-cadet-dark/40 border border-white/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={cn(
                    "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                    isActive
                      ? "text-foreground"
                      : "text-air-sup-blue/60 hover:text-air-sup-blue hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-azure/20 to-transparent border-l-2 border-cyan-azure rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={cn("w-4.5 h-4.5 shrink-0 transition-colors", isActive ? "text-cyan-azure" : "group-hover:text-air-sup-blue")} />
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{tab.label}</p>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")} />
                </button>
              );
            })}
          </nav>

          <div className="mt-6 p-5 rounded-2xl glass-card border-cyan-azure/10">
            <p className="text-xs font-semibold text-cyan-azure uppercase tracking-wider mb-2">Need Help?</p>
            <p className="text-xs text-air-sup-blue/60 leading-relaxed mb-4">Check our documentation for advanced configuration guides.</p>
            <button className="text-xs font-medium text-pink-lavender hover:text-white transition-colors flex items-center gap-1">
              View Documentation <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex-1 glass-card rounded-2xl overflow-hidden min-h-[560px] flex flex-col"
        >
          <div className="p-6 md:p-8 flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Email Notifications</h2>
                    <p className="text-sm text-air-sup-blue/60 mt-1">Configure when and how you want to be alerted.</p>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { title: 'Scan Completions', desc: 'Get notified when a large batch scan finishes.' },
                      { title: 'Security Alerts', desc: 'Get notified about unrecognized logins.' },
                      { title: 'Team Activity', desc: 'When team members join or share reports.' },
                      { title: 'Product Updates', desc: 'News about new detectors and features.' },
                    ].map((item, i) => (
                      <div key={i} className="group flex items-start justify-between p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                        <div className="pr-4">
                          <p className="text-sm font-semibold text-foreground group-hover:text-cyan-azure-light transition-colors">{item.title}</p>
                          <p className="text-xs text-air-sup-blue/60 mt-1">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer mt-1">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-10 h-5.5 bg-space-cadet-light/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white/80 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-azure shadow-inner transition-colors"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Privacy & Data</h2>
                    <p className="text-sm text-air-sup-blue/60 mt-1">Control your data footprint and privacy settings.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-azure/10 border border-cyan-azure/20">
                          <Shield className="w-5 h-5 text-cyan-azure" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Data Retention</h3>
                      </div>
                      <p className="text-xs text-air-sup-blue/60 max-w-md">
                        Choose how long AI Shield stores your scan history. After this period, reports and analyzed content are permanently deleted from our servers.
                      </p>
                      <select className="w-full max-w-xs bg-space-cadet-dark/80 border border-white/10 text-foreground text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-azure/50 outline-none transition-all">
                        <option>Keep scans forever</option>
                        <option>Auto-delete after 30 days</option>
                        <option>Auto-delete after 7 days</option>
                      </select>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                      <h3 className="text-sm font-semibold text-foreground">Account Visibility</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-air-sup-blue/60">Allow other team members to see your scan activity.</p>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-10 h-5.5 bg-space-cadet-light/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white/80 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-azure shadow-inner transition-colors"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Appearance</h2>
                    <p className="text-sm text-air-sup-blue/60 mt-1">Customize your visual interface experience.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Theme Preference
                      <span className="text-[10px] bg-pink-lavender/10 text-pink-lavender px-1.5 py-0.5 rounded border border-pink-lavender/20 uppercase tracking-tighter">Updated</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Dark Theme */}
                      <div className="group relative border-2 border-cyan-azure bg-space-cadet-dark rounded-2xl p-4 cursor-pointer overflow-hidden shadow-palette-glow transition-all">
                        <div className="absolute top-3 right-3 w-4 h-4 bg-cyan-azure rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                        <div className="w-full h-24 bg-space-cadet rounded-xl border border-white/5 mb-3 flex flex-col gap-2 p-3">
                          <div className="w-full h-3 bg-ucla-blue/30 rounded-sm" />
                          <div className="w-2/3 h-3 bg-ucla-blue/20 rounded-sm" />
                        </div>
                        <p className="text-sm font-semibold text-center text-foreground">Dark UI</p>
                      </div>
                      
                      {/* Light Theme */}
                      <div className="group relative border border-white/5 bg-slate-50/5 rounded-2xl p-4 cursor-not-allowed opacity-40 overflow-hidden transition-all grayscale">
                        <div className="w-full h-24 bg-white/10 rounded-xl border border-white/10 mb-3 flex flex-col gap-2 p-3">
                          <div className="w-full h-3 bg-white/20 rounded-sm" />
                          <div className="w-2/3 h-3 bg-white/10 rounded-sm" />
                        </div>
                        <p className="text-sm font-semibold text-center text-air-sup-blue">Light UI</p>
                        <div className="absolute inset-0 flex items-center justify-center bg-space-cadet/20 backdrop-blur-[1px]">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 rotate-[-15deg]">Coming Soon</span>
                        </div>
                      </div>
                      
                      {/* System Theme */}
                      <div className="group relative border border-white/5 bg-gradient-to-br from-space-cadet-dark/50 to-slate-50/10 rounded-2xl p-4 cursor-not-allowed opacity-40 overflow-hidden transition-all grayscale">
                        <div className="w-full h-24 flex mb-3 rounded-xl overflow-hidden border border-white/10">
                           <div className="flex-1 bg-space-cadet p-3">
                             <div className="w-full h-3 bg-white/5 rounded-sm mb-2" />
                           </div>
                           <div className="flex-1 bg-slate-100/10 p-3">
                             <div className="w-full h-3 bg-white/5 rounded-sm mb-2" />
                           </div>
                        </div>
                        <p className="text-sm font-semibold text-center text-air-sup-blue">System Sync</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 bg-white/5 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-air-sup-blue/40">Last updated: Today at 10:42 AM</p>
            <button className="btn-shimmer flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-cyan-azure to-air-sup-blue text-white text-sm font-bold rounded-xl shadow-palette transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

