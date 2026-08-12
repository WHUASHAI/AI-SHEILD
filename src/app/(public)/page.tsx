import { Hero }                  from '@/components/landing/hero';
import { StatsBar }              from '@/components/landing/stats-bar';
import { Features }              from '@/components/landing/features';
import { HowItWorks }            from '@/components/landing/how-it-works';
import { DetectionCapabilities } from '@/components/landing/detection-capabilities';
import { FreePlatform }          from '@/components/landing/free-platform';
import { UseCases }              from '@/components/landing/use-cases';
import { TrustTransparency }     from '@/components/landing/trust-transparency';
import { FAQ }                   from '@/components/landing/faq';
import { StartScanning }         from '@/components/landing/start-scanning';

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <DetectionCapabilities />
      <FreePlatform />
      <UseCases />
      <TrustTransparency />
      <FAQ />
      <StartScanning />
    </>
  );
}
