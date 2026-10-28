import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, HelpCircle, ShieldCheck } from 'lucide-react';
import { FAQ } from '@/components/landing/faq';

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Explore Elucid AI guides, learn how to interpret detection results, and find answers to common questions.',
};

const resources = [
  {
    title: 'How detection works',
    description: 'Learn about the analysis behind text, image, video, and deepfake detection.',
    href: '/how-it-works',
    icon: BookOpen,
  },
  {
    title: 'Accuracy and limitations',
    description: 'Understand probability scores, false positives, and the role of human review.',
    href: '/limitations',
    icon: ShieldCheck,
  },
  {
    title: 'Frequently asked questions',
    description: 'Find answers about scanning, supported content, and using results responsibly.',
    href: '#questions',
    icon: HelpCircle,
  },
];

export default function ResourcesPage() {
  return (
    <>
      <section className="container mx-auto max-w-6xl px-4 pb-20 pt-32">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-pink-lavender">Learn with Elucid AI</p>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-foreground md:text-5xl">Resources</h1>
          <p className="text-lg leading-relaxed text-air-sup-blue">
            Get to know the tools, understand your results, and make informed decisions about digital content.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {resources.map(({ title, description, href, icon: Icon }) => (
            <Link key={href} href={href} className="group rounded-2xl border border-cyan-azure/20 bg-space-cadet-light/20 p-7 transition-colors hover:border-cyan-azure/50 hover:bg-cyan-azure/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-azure">
              <Icon aria-hidden="true" className="mb-6 h-7 w-7 text-cyan-azure" />
              <h2 className="mb-3 flex items-start justify-between gap-3 text-lg font-semibold text-foreground">
                {title}
                <ArrowUpRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-air-sup-blue transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </h2>
              <p className="text-sm leading-relaxed text-air-sup-blue">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <div id="questions" className="scroll-mt-16">
        <FAQ />
      </div>
    </>
  );
}
