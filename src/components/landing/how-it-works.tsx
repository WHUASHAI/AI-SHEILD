import { UploadCloud, ScanLine, BarChart3, Download } from 'lucide-react';

const steps = [
  { title: 'Upload Your Content', icon: UploadCloud, desc: 'Drag and drop text, images, or videos into the scanner.' },
  { title: 'Run the Analysis',    icon: ScanLine,    desc: 'Our ensemble of AI models analyzes the content for synthetic signatures.' },
  { title: 'Review the Evidence', icon: BarChart3,   desc: 'See a detailed breakdown of detected signals and overall probability.' },
  { title: 'Export the Report',   icon: Download,    desc: 'Download a verifiable PDF report for your records or sharing.' },
];

const stepAccents = [
  { icon: 'text-cyan-azure',    num: 'bg-cyan-azure',    border: 'border-cyan-azure/30',    bg: 'bg-cyan-azure/10'    },
  { icon: 'text-air-sup-blue',  num: 'bg-air-sup-blue',  border: 'border-air-sup-blue/30',  bg: 'bg-air-sup-blue/10'  },
  { icon: 'text-pink-lavender', num: 'bg-pink-lavender', border: 'border-pink-lavender/30', bg: 'bg-pink-lavender/10' },
  { icon: 'text-ucla-blue-light',num: 'bg-ucla-blue',    border: 'border-ucla-blue/30',     bg: 'bg-ucla-blue/15'     },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-space-cadet-light/20 border-y border-cyan-azure/15 relative overflow-hidden">
      {/* background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-azure/4 via-transparent to-pink-lavender/4 pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full badge-primary text-xs font-semibold uppercase tracking-wider mb-4 text-cyan-azure">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            How It <span className="gradient-text-primary">Works</span>
          </h2>
          <p className="text-air-sup-blue max-w-2xl mx-auto">
            Get comprehensive results in seconds with our streamlined process.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-8 left-[10%] w-[80%] h-px bg-gradient-to-r from-cyan-azure/20 via-pink-lavender/30 to-cyan-azure/20 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, i) => {
              const a = stepAccents[i];
              return (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className={`w-16 h-16 rounded-2xl ${a.bg} border ${a.border} flex items-center justify-center mb-6 shadow-palette-md relative transition-all duration-300 group-hover:scale-105 group-hover:shadow-palette-glow`}>
                    <step.icon className={`w-8 h-8 ${a.icon}`} />
                    <div className={`absolute -top-3 -right-3 w-6 h-6 rounded-full ${a.num} text-white text-xs font-bold flex items-center justify-center border-2 border-space-cadet-dark`}>
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-pink-lavender transition-colors">{step.title}</h3>
                  <p className="text-sm text-air-sup-blue leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
