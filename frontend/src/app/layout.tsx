import type { Metadata } from 'next';

import '@root/assets/styles/global.scss';
import { ClientLayout } from '@/layout/ClientLayout';
import { poppins } from '@/utils/fonts';

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
    <html lang="fr" className={poppins.variable}>
      <body className="font-poppins">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
