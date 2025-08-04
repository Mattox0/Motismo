import HowItWorks from '@/components/HowItWorks';
import { FonctionalitySection } from '@/components/sections/FonctionalitySection';
import { FooterHeroSection } from '@/components/sections/FooterHeroSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { GlobalLayout } from '@/layout/GlobalLayout';

export default function Home() {
  return (
    <GlobalLayout>
      <p>Hello World</p>
      <HeroSection />
      <FonctionalitySection />
      <HowItWorks />
      <FooterHeroSection />
    </GlobalLayout>
  );
}
