'use client';

import { Navbar } from '@/components/Navbar';

interface GlobalLayoutProps {
  children: React.ReactNode;
}

export const GlobalLayout = ({ children }: GlobalLayoutProps) => {
  return (
    <main className="min-h-screen">
      <Navbar />
      {children}
    </main>
  );
};
