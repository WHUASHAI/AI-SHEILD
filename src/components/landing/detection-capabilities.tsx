import { FileText, Image as ImageIcon, Video, Database } from 'lucide-react';

const columns = [
  {
    title: 'Text Signals',
    icon: FileText,
    items: ['Perplexity & Burstiness', 'Predictable token choices', 'Repetitive phrasing structures', 'Lack of semantic depth']
  },
  {
    title: 'Image Signals',
    icon: ImageIcon,
    items: ['Inconsistent lighting/shadows', 'Asymmetrical features (hands, eyes)', 'Unnatural texture patterns', 'Generative noise artifacts']
  },
  {
    title: 'Video Signals',
    icon: Video,
    items: ['Temporal inconsistency', 'Unnatural blinking patterns', 'Audio-visual desynchronization', 'Edge bleeding around subjects']
  },
  {
    title: 'Metadata Signals',
    icon: Database,
    items: ['Missing EXIF data', 'Software signatures (e.g. Photoshop)', 'Inconsistent timestamps', 'Known AI tool footprints']
  }
];

export function DetectionCapabilities() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Comprehensive Detection Capabilities</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our multi-modal approach looks at hundreds of subtle signals across different media types.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {columns.map((col, i) => (
            <div key={i} className="p-6 rounded-2xl bg-surface border border-border">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <col.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white">{col.title}</h3>
              </div>
              <ul className="space-y-4">
                {col.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-12 max-w-3xl mx-auto">
          Note: Not every signal is available for every file. Missing metadata does not automatically indicate AI-generated content, but serves as one of many indicators in our overall probability assessment.
        </p>
      </div>
    </section>
  );
}
