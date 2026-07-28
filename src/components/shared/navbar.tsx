'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Use Cases', href: '/use-cases' },
    { name: 'API', href: '/api-docs' },
    { name: 'Resources', href: '/resources' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300 border-b border-transparent',
        isScrolled ? 'bg-background/80 backdrop-blur-md border-border shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 z-50">
          <Logo size="md" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <div className="relative group">
            <button
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
                <div className="bg-surface border border-border rounded-lg shadow-lg overflow-hidden py-2">
                  {[
                    'Text Detector',
                    'Image Detector',
                    'Video Detector',
                    'Deepfake Detector',
                    'Enhancement Detector',
                    'Batch Scanner'
                  ].map((item) => (
                    <Link
                      key={item}
                      href={`/tools/${item.toLowerCase().replace(' ', '-')}`}
                      className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {item}
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
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right side Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0" asChild>
            <Link href="/dashboard/new-scan">Start Scanning</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden z-50 text-foreground p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border py-4 px-4 flex flex-col gap-4 shadow-xl">
          <div className="flex flex-col gap-2">
            <div className="font-semibold px-2 py-1 text-foreground">Product</div>
            <div className="pl-4 flex flex-col gap-2">
               {[
                  'Text Detector',
                  'Image Detector',
                  'Video Detector',
                  'Deepfake Detector',
                  'Enhancement Detector',
                  'Batch Scanner'
                ].map((item) => (
                  <Link
                    key={item}
                    href={`/tools/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-sm text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
            </div>
          </div>
          {navLinks.map((link) => (
             <Link
             key={link.name}
             href={link.href}
             className="px-2 py-1 font-medium text-foreground"
             onClick={() => setMobileMenuOpen(false)}
           >
             {link.name}
           </Link>
          ))}
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
             <Button variant="outline" className="w-full" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link href="/dashboard/new-scan">Start Scanning</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
