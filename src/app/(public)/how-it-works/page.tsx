import { ScanSearch, FileText, Image as ImageIcon, Video, Fingerprint } from 'lucide-react';
import { DisclaimerBanner } from '@/components/shared/disclaimer-banner';

export default function HowItWorksPage() {
  return (
    <div className="pt-32 pb-20 container mx-auto px-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-6">How AI Sheild Works</h1>
      <p className="text-lg text-muted-foreground mb-12">
        Understanding the technology behind our multi-modal AI detection platform.
      </p>

      <DisclaimerBanner className="mb-12" />

      <section className="mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <ScanSearch className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white">Detection Methodology</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          AI Sheild doesn't just look for "watermarks." Instead, it uses an ensemble of specialized machine learning models to analyze content at a deep, structural level. We look for the mathematical signatures left behind by generative algorithms.
        </p>
        <p className="text-muted-foreground">
          Generative AI models are fundamentally predictive engines. They choose the most statistically likely pixel or word based on their training data. This predictability leaves a "fingerprint" that our models are trained to detect.
        </p>
      </section>

      <div className="grid gap-8 mb-16">
        <div className="p-8 bg-surface border border-border rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-medium text-white">Text Analysis</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Our text detection evaluates two primary metrics: <strong>Perplexity</strong> and <strong>Burstiness</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
            <li><strong>Perplexity:</strong> A measure of how predictable the text is. AI models tend to produce text with low perplexity (highly predictable word choices). Human writing typically uses more complex, unexpected vocabulary.</li>
            <li><strong>Burstiness:</strong> A measure of variation in sentence length and structure. Humans naturally write with high burstiness (mixing short and long sentences). AI often produces text with uniform sentence lengths and structures.</li>
          </ul>
        </div>

        <div className="p-8 bg-surface border border-border rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-medium text-white">Image Analysis</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Image generation models like diffusion models leave specific artifacts that are often invisible to the naked eye.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
            <li><strong>Frequency Domain Analysis:</strong> We convert images to the frequency domain (using Fast Fourier Transforms) to look for unnatural repeating patterns in the high-frequency spectrum caused by upscaling and denoising processes.</li>
            <li><strong>Semantic Inconsistencies:</strong> Our models check for common generative errors, such as asymmetrical lighting, physically impossible reflections, or distorted anatomical features (like hands).</li>
            <li><strong>Noise Profiles:</strong> Human cameras leave specific sensor noise. AI images often lack this organic noise or feature synthetic noise patterns.</li>
          </ul>
        </div>

        <div className="p-8 bg-surface border border-border rounded-2xl">
           <div className="flex items-center gap-3 mb-4">
            <Video className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-medium text-white">Video & Deepfake Analysis</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Video analysis examines temporal consistency across frames.
          </p>
           <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
            <li><strong>Frame-by-Frame Consistency:</strong> We analyze the subtle flickering or morphing artifacts that often occur in AI-generated video between frames.</li>
            <li><strong>Biological Signals:</strong> For deepfakes, we look for irregular blinking patterns, unnatural heart-rate micro-color variations in skin tone (rPPG), and audio-visual desynchronization.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
