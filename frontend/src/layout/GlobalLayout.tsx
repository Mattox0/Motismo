'use client';

import { Navbar } from '@/components/Navbar';

interface GlobalLayoutProps {
  children: React.ReactNode;
  screened?: boolean;
}

export const GlobalLayout = ({ children, screened = false }: GlobalLayoutProps) => {
  return (
    <main className={`global-layout ${screened ? 'screened' : ''}`}>
      <Navbar />
      {children}
    </main>
  );
};
