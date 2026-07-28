import { ShieldCheck, Target, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="pt-32 pb-20 container mx-auto px-4 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-6">About AI Sheild</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We are on a mission to bring transparency and trust to digital media in the era of Generative AI.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="p-6 bg-surface border border-border rounded-xl text-center">
          <Target className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Our Mission</h3>
          <p className="text-sm text-muted-foreground">To provide accessible, state-of-the-art tools to verify the origin of digital content.</p>
        </div>
        <div className="p-6 bg-surface border border-border rounded-xl text-center">
          <ShieldCheck className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Responsible Tech</h3>
          <p className="text-sm text-muted-foreground">Building detection models that are transparent about their limitations and statistical nature.</p>
        </div>
        <div className="p-6 bg-surface border border-border rounded-xl text-center">
          <Heart className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Free for Everyone</h3>
          <p className="text-sm text-muted-foreground">Committed to keeping our core detection tools completely free without paywalls.</p>
        </div>
      </div>

      <div className="prose prose-invert prose-cyan max-w-none">
        <h2 className="text-2xl font-bold text-white mb-4">Why AI Sheild Was Built</h2>
        <p className="text-muted-foreground mb-6">
          The rapid advancement of generative AI has brought incredible creative tools to the world. However, it has also introduced significant challenges regarding trust, authenticity, and misinformation. As deepfakes become more convincing and AI-written text becomes indistinguishable from human writing, the need for robust verification tools has never been greater.
        </p>
        <p className="text-muted-foreground mb-10">
          We noticed that most high-quality AI detection tools were locked behind expensive subscriptions or restricted to enterprise clients. We built AI Sheild to democratize access to these vital technologies, ensuring that educators, journalists, and everyday users can verify the media they interact with.
        </p>

        <h2 className="text-2xl font-bold text-white mb-4">How It Works (Overview)</h2>
        <p className="text-muted-foreground mb-6">
          AI Sheild utilizes an ensemble of machine learning models trained on vast datasets of both human-created and AI-generated content. For text, we analyze perplexity and burstiness. For images and videos, we detect subtle artifacts in pixel distribution, frequency domains, and compression artifacts that human eyes naturally miss.
        </p>
        <p className="text-muted-foreground mb-10">
          Importantly, our platform correlates multiple signals rather than relying on a single metric, providing a more robust probability assessment.
        </p>

        <h2 className="text-2xl font-bold text-white mb-4">Our Commitment</h2>
        <p className="text-muted-foreground mb-6">
          We are committed to maintaining AI Sheild as a free, open platform. We fund our infrastructure through fair-use policies and API usage for high-volume enterprise integrations, ensuring the web interface remains accessible to the public. We also pledge to continuously update our models to keep pace with the latest generative AI advancements while remaining radically transparent about the limitations of detection technology.
        </p>
      </div>
    </div>
  );
}
