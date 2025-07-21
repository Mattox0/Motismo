import React, { ReactNode } from 'react';

interface IAuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<IAuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-page">
      <div className="auth-container">{children}</div>
    </div>
  );
};

export default AuthLayout;
