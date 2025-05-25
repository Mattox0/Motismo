import { signIn } from 'next-auth/react';
import React from 'react';

const SocialLogin: React.FC = () => {
  return (
    <div className="social-login">
      <button className="social-button" onClick={() => signIn('google')}>
        <span className="google-icon">G</span>
        Google
      </button>
    </div>
  );
};

export default SocialLogin;
