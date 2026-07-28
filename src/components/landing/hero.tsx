'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck, FileText, ImageIcon, Scan, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-cyan-500/10 to-transparent blur-3xl -z-10 pointer-events-none" />
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Text Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
                <ShieldCheck className="w-4 h-4" />
                Free • No Payment Required • Open Platform
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                Know Where Digital Content <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Really Came From
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                The most advanced, completely free AI detection platform. Analyze text, images, and videos for signs of AI generation, synthetic editing, enhancement, and deepfake manipulation.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-4">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 text-base h-12 px-8" asChild>
                  <Link href="/dashboard/new-scan">
                    Start Scanning for Free
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8" asChild>
                  <Link href="/sample-report">
                    View Sample Report
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Free to use. No payment information required.</p>
            </motion.div>
          </div>

          {/* Right Product Preview */}
          <motion.div 
            className="flex-1 w-full max-w-lg lg:max-w-none relative z-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative rounded-2xl border border-border bg-surface p-6 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
              
              {/* Fake UI */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-cyan-500/20 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">portrait_shot.jpg</div>
                    <div className="text-xs text-muted-foreground">2.4 MB • Image Analysis</div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  Likely AI-Generated
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">AI Probability</span>
                  <span className="text-foreground font-bold">87%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500" 
                    initial={{ width: 0 }}
                    animate={{ width: '87%' }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-foreground mb-2">Detected Signals</div>
                
                {[
                  { icon: Scan, text: 'Unnatural texture patterns detected in background', color: 'text-amber-400' },
                  { icon: FileText, text: 'Missing EXIF camera metadata', color: 'text-cyan-400' },
                  { icon: CheckCircle2, text: 'Lighting inconsistencies on subject', color: 'text-red-400' }
                ].map((signal, i) => (
                  <motion.div 
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1 + (i * 0.2) }}
                  >
                    <signal.icon className={`w-4 h-4 mt-0.5 ${signal.color}`} />
                    <span className="text-sm text-muted-foreground">{signal.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Decorative background elements */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-20 -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
