'use client';

import { Provider as ReduxProvider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { I18nProvider } from '@/providers/I18nProvider';
import { SessionProvider } from '@/providers/SessionProvider';
import { setupStore } from '@/store';
import { defaultOptions } from '@/utils/toast';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const store = setupStore();

  return (
    <ReduxProvider store={store}>
      <SessionProvider>
        <I18nProvider>
          {children}
          <ToastContainer {...defaultOptions} />
        </I18nProvider>
      </SessionProvider>
    </ReduxProvider>
  );
}
