'use client';

import { Navbar } from '@/components/Navbar';

interface IGlobalLayoutProps {
  children: React.ReactNode;
  screened?: boolean;
}

export const GlobalLayout = ({ children, screened = false }: IGlobalLayoutProps) => {
  return (
    <main className={`global-layout ${screened ? 'screened' : ''}`}>
      <Navbar />
      {children}
    </main>
  );
};
