import React, { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-page">
      <div className="auth-container">{children}</div>
    </div>
  );
};

export default AuthLayout;
