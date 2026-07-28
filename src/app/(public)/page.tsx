import { Features } from '@/components/landing/features';
import { StartScanning } from '@/components/landing/start-scanning';
import { HowItWorks } from '@/components/landing/how-it-works';
import { DetectionCapabilities } from '@/components/landing/detection-capabilities';

export default function HomePage() {
  return (
    <>
      <Features />
      <StartScanning />
      <HowItWorks />
      <DetectionCapabilities />
    </>
  );
}
