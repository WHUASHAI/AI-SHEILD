'use client';

import { Search, ChevronDown, Book, Shield, FileText, Code, User, AlertCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const FAQS = [
  {
    q: "How accurate is AI Shield?",
    a: "AI Shield provides highly accurate probability-based analysis using advanced machine learning models. However, it is not 100% foolproof and can occasionally produce false positives or negatives. Results should be used as one data point in a broader review process."
  },
  {
    q: "What types of files can I scan?",
    a: "We support text (TXT, DOCX, PDF), images (JPG, PNG, WebP), and video/audio (MP4, MP3, WAV). File size limits apply depending on your current usage tier."
  },
  {
    q: "Is my data kept private?",
    a: "Yes. By default, your scanned files are stored securely and encrypted at rest. You can adjust your data retention settings in your account Privacy tab to automatically delete scans after a certain period."
  },
  {
    q: "What does 'Inconclusive' mean?",
    a: "An inconclusive result means our models could not determine with sufficient confidence whether the content is human or AI-generated. This often happens with very short text excerpts, heavily compressed images, or low-resolution video."
  }
];

const CATEGORIES = [
  { icon: Book, title: "Getting Started", desc: "Basics of using the platform" },
  { icon: Shield, title: "Detection Models", desc: "Understanding the AI detectors" },
  { icon: FileText, title: "Reports & Exports", desc: "Sharing and saving results" },
  { icon: Code, title: "API Integration", desc: "Connecting your own apps" },
  { icon: User, title: "Account & Team", desc: "Managing access and seats" },
  { icon: AlertCircle, title: "Privacy & Security", desc: "How we handle your data" },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Hero / Search */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-lg pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#06b6d4]/10 rounded-full blur-3xl mix-blend-screen" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#3b82f6]/10 rounded-full blur-3xl mix-blend-screen" />
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-4">How can we help you today?</h1>
          <p className="text-gray-400 mb-8">Search our knowledge base or browse categories below.</p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search for articles, tutorials, or guides..." 
              className="w-full bg-[#0a0f1e] border border-[#1f2937] text-white rounded-full pl-12 pr-6 py-3.5 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] shadow-lg transition-all"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat, i) => (
            <div key={i} className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 hover:border-[#374151] hover:bg-[#1f2937]/30 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-[#0a0f1e] border border-[#1f2937] flex items-center justify-center text-[#06b6d4] mb-4 group-hover:scale-110 transition-transform">
                <cat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-white font-medium mb-1">{cat.title}</h3>
              <p className="text-sm text-gray-400">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 md:p-8">
        <h2 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div 
              key={i} 
              className="border border-[#1f2937] rounded-lg overflow-hidden bg-[#0a0f1e]"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
              >
                <span className="font-medium text-gray-200">{faq.q}</span>
                <ChevronDown className={cn(
                  "w-5 h-5 text-gray-500 transition-transform",
                  openFaq === i ? "rotate-180" : ""
                )} />
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="p-4 pt-0 text-sm text-gray-400 border-t border-[#1f2937]">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Footer */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-gradient-to-br from-[#111827] to-[#0a0f1e] border border-[#1f2937] rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium mb-1">Still need help?</h3>
            <p className="text-sm text-gray-400">Our support team is ready to assist you.</p>
          </div>
          <button className="px-4 py-2 bg-[#1f2937] hover:bg-[#374151] text-white text-sm font-medium rounded-md transition-colors">
            Contact Support
          </button>
        </div>

        <Link href="#" className="flex-1 bg-gradient-to-br from-[#111827] to-[#0a0f1e] border border-[#1f2937] rounded-xl p-6 flex items-center justify-between group hover:border-[#374151] transition-colors">
          <div>
            <h3 className="text-white font-medium mb-1 flex items-center gap-2">
              System Status <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </h3>
            <p className="text-sm text-gray-400">All systems operational</p>
          </div>
          <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
        </Link>
      </div>
      
      <div className="text-center text-xs text-gray-500">
        <p>AI Shield Probability Disclaimer: Results may contain false positives/negatives.</p>
      </div>
    </div>
  );
}
