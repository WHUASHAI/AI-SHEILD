'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isScrolled, setIsScrolled]               = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]         = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Use Cases',    href: '/use-cases' },
    { name: 'Resources',    href: '/resources' },
    { name: 'About',        href: '/about' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-500',
        isScrolled
          ? 'bg-[rgba(7,15,29,0.88)] backdrop-blur-xl shadow-[0_1px_0_rgba(78,122,177,0.25),0_4px_24px_rgba(7,15,29,0.5)]'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Logo size="md" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <div className="relative group">
            <button
              className="flex items-center gap-1 text-sm font-medium text-air-sup-blue hover:text-pink-lavender transition-colors"
              onMouseEnter={() => setProductDropdownOpen(true)}
              onMouseLeave={() => setProductDropdownOpen(false)}
            >
              Product <ChevronDown className="w-4 h-4" />
            </button>
            {productDropdownOpen && (
              <div
                className="absolute top-full left-0 pt-4 w-64"
                onMouseEnter={() => setProductDropdownOpen(true)}
                onMouseLeave={() => setProductDropdownOpen(false)}
              >
                <div className="glass-card rounded-xl shadow-palette overflow-hidden py-2">
                  {[
                    { label: 'Text Detector', href: '/dashboard/text' },
                    { label: 'Image Detector', href: '/dashboard/image' },
                    { label: 'Video Detector', href: '/dashboard/video' },
                    { label: 'Deepfake Detector', href: '/dashboard/deepfake' },
                    { label: 'Enhancement Detector', href: '/dashboard/enhancement' },
                    { label: 'Plagiarism Detector', href: '/dashboard/plagiarism' },
                    { label: 'Batch Scanner', href: '/dashboard/batch' }
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-air-sup-blue hover:bg-cyan-azure/10 hover:text-pink-lavender transition-colors"
                      onClick={() => setProductDropdownOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-air-sup-blue hover:text-pink-lavender transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right-side Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            className="bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white border-0 shadow-palette-md"
            asChild
          >
            <Link href="/dashboard/new-scan">Start Scanning</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden z-50 text-air-sup-blue hover:text-pink-lavender p-2 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-space-cadet/95 backdrop-blur-xl border-t border-cyan-azure/20 py-8 px-6 flex flex-col gap-8 shadow-2xl overflow-y-auto">
          <div className="flex flex-col gap-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ucla-blue px-2">
              Product Tools
            </div>
            <div className="grid grid-cols-1 gap-1">
              {[
                { label: 'Text Detector', href: '/dashboard/text' },
                { label: 'Image Detector', href: '/dashboard/image' },
                { label: 'Video Detector', href: '/dashboard/video' },
                { label: 'Deepfake Detector', href: '/dashboard/deepfake' },
                { label: 'Enhancement Detector', href: '/dashboard/enhancement' },
                { label: 'Batch Scanner', href: '/dashboard/batch' }
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-air-sup-blue rounded-lg hover:bg-cyan-azure/10 hover:text-pink-lavender transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-cyan-azure/20 pt-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3 py-3 text-base font-semibold text-foreground rounded-lg hover:bg-cyan-azure/10 hover:text-pink-lavender transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 mt-auto">
            <Button
              className="w-full h-11 bg-gradient-to-r from-cyan-azure to-air-sup-blue hover:from-cyan-azure-dark hover:to-cyan-azure text-white"
              asChild
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link href="/dashboard/new-scan">Start Scanning</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
