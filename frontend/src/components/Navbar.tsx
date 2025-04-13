'use client';

import { useTranslation } from 'react-i18next';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  return (
    <nav>
      <h1>{t('app.name')}</h1>
    </nav>
  );
};
