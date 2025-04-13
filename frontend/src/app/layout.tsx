import type { Metadata } from 'next';

import '@root/assets/styles/global.scss';
import { I18nProvider } from '@/providers/I18nProvider';

export const metadata: Metadata = {
  title: 'Motismo',
  description: 'Application de quizz interactifs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
