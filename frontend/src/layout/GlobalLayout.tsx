import { FC, ReactNode } from 'react';

import { Navbar } from '@/components/Navbar';

interface GlobalLayoutProps {
  children: ReactNode;
}

export const GlobalLayout: FC<GlobalLayoutProps> = ({ children }) => {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};
