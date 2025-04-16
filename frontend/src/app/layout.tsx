import type { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';

import '@root/assets/styles/global.scss';
import 'react-toastify/dist/ReactToastify.css';
import { I18nProvider } from '@/providers/I18nProvider';
import { SessionProvider } from '@/providers/SessionProvider';
import { poppins } from '@/utils/fonts';
import { defaultOptions } from '@/utils/toast';

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
        <SessionProvider>
          <I18nProvider>
            {children}
            <ToastContainer {...defaultOptions} />
          </I18nProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
