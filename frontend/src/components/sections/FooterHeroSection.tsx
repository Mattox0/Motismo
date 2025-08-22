'use client';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/forms/Button';

export const FooterHeroSection: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="footer-hero">
      <h2 className="footer-hero-title">{t('footerHero.title')}</h2>
      <p className="footer-hero-description">{t('footerHero.description')}</p>
      <Button
        variant="secondary"
        className="white footer-hero-button"
        startIcon={<RocketLaunchIcon />}
        onClick={() => router.push('/profile')}
      >
        {t('footerHero.button')}
      </Button>
    </div>
  );
};
