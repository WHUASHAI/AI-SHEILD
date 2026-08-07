import { FileText, Image as ImageIcon, Video, Database } from 'lucide-react';

const columns = [
  {
    title: 'Text Signals',
    icon: FileText,
    accent: 'text-cyan-azure bg-cyan-azure/15 border-cyan-azure/30',
    dot: 'bg-cyan-azure',
    items: [
      'Perplexity & Burstiness',
      'Predictable token choices',
      'Repetitive phrasing structures',
      'Lack of semantic depth',
    ],
  },
  {
    title: 'Image Signals',
    icon: ImageIcon,
    accent: 'text-pink-lavender bg-pink-lavender/15 border-pink-lavender/30',
    dot: 'bg-pink-lavender',
    items: [
      'Inconsistent lighting/shadows',
      'Asymmetrical features (hands, eyes)',
      'Unnatural texture patterns',
      'Generative noise artifacts',
    ],
  },
  {
    title: 'Video Signals',
    icon: Video,
    accent: 'text-air-sup-blue bg-air-sup-blue/15 border-air-sup-blue/30',
    dot: 'bg-air-sup-blue',
    items: [
      'Temporal inconsistency',
      'Unnatural blinking patterns',
      'Audio-visual desynchronization',
      'Edge bleeding around subjects',
    ],
  },
  {
    title: 'Metadata Signals',
    icon: Database,
    accent: 'text-ucla-blue-light bg-ucla-blue/20 border-ucla-blue/30',
    dot: 'bg-ucla-blue-light',
    items: [
      'Missing EXIF data',
      'Software signatures (e.g. Photoshop)',
      'Inconsistent timestamps',
      'Known AI tool footprints',
    ],
  },
];

export function DetectionCapabilities() {
  return (
    <section className="py-24 bg-space-cadet relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-cyan-azure/8 rounded-full blur-[80px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-pink-lavender/8 rounded-full blur-[80px] -translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full badge-accent text-xs font-semibold uppercase tracking-wider mb-4">
            Multi-Modal Analysis
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Comprehensive{' '}
            <span className="gradient-text">Detection Capabilities</span>
          </h2>
          <p className="text-air-sup-blue max-w-2xl mx-auto leading-relaxed">
            Our multi-modal approach looks at hundreds of subtle signals across different media types.
          </p>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {columns.map((col, i) => (
            <div key={i} className="glass-card glass-card-hover p-6 rounded-2xl">
              {/* Column header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyan-azure/15">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${col.accent}`}>
                  <col.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground">{col.title}</h3>
              </div>

              {/* Signal list */}
              <ul className="space-y-4">
                {col.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${col.dot}`} />
                    <span className="text-sm text-air-sup-blue leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-ucla-blue mt-12 max-w-3xl mx-auto leading-relaxed">
          Note: Not every signal is available for every file. Missing metadata does not automatically
          indicate AI-generated content, but serves as one of many indicators in our overall
          probability assessment.
        </p>
      </div>
    </section>
  );
}
