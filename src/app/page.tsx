import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Pricing';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <HowItWorks />
      <Pricing />
    </main>
  );
}
