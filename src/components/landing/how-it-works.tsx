import { UploadCloud, ScanLine, BarChart3, Download } from 'lucide-react';

const steps = [
  { title: 'Upload Your Content', icon: UploadCloud, desc: 'Drag and drop text, images, or videos into the scanner.' },
  { title: 'Run the Analysis', icon: ScanLine, desc: 'Our ensemble of AI models analyzes the content for synthetic signatures.' },
  { title: 'Review the Evidence', icon: BarChart3, desc: 'See a detailed breakdown of detected signals and overall probability.' },
  { title: 'Export the Report', icon: Download, desc: 'Download a verifiable PDF report for your records or sharing.' },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-surface border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get comprehensive results in seconds with our streamlined process.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-border -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center mb-6 shadow-sm relative">
                  <step.icon className="w-8 h-8 text-cyan-400" />
                  <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-cyan-500 text-white text-xs font-bold flex items-center justify-center border-2 border-surface">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
