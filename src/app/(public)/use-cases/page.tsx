import type { Metadata } from 'next';
import { UseCases } from '@/components/landing/use-cases';
import { StartScanning } from '@/components/landing/start-scanning';
import { DisclaimerBanner } from '@/components/shared/disclaimer-banner';

export const metadata: Metadata = {
  title: 'Use Cases',
  description: 'Explore how educators, journalists, researchers, and other users can include Elucid AI in their content verification workflow.',
};

export default function UseCasesPage() {
  return (
    <>
      <section className="container mx-auto max-w-4xl px-4 pb-12 pt-32">
        <h1 className="mb-5 text-4xl font-bold tracking-tight text-foreground md:text-5xl">Use Cases</h1>
        <p className="mb-8 text-lg leading-relaxed text-air-sup-blue">
          Explore ways to use content analysis in education, publishing, research, and everyday verification.
          Combine detection results with source checks and human judgment.
        </p>
        <DisclaimerBanner />
      </section>
      <UseCases />
      <StartScanning />
    </>
  );
}
