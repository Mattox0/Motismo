'use client';

import HowItWorks from '@/components/HowItWorks';
import { FonctionalitySection } from '@/components/sections/FonctionalitySection';
import { FooterHeroSection } from '@/components/sections/FooterHeroSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { SplashScreen } from '@/components/SplashScreen';
import { useAuth } from '@/hooks/useAuth';
import { GlobalLayout } from '@/layout/GlobalLayout';

export default function Home() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <SplashScreen />;
  }

  return (
    <GlobalLayout>
      <HeroSection />
      <FonctionalitySection />
      <HowItWorks />
      <FooterHeroSection />
    </GlobalLayout>
  );
}
