import { signIn } from 'next-auth/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const SocialLogin: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="social-login">
      <button className="social-button" onClick={() => signIn('google')}>
        <span className="google-icon">G</span>
        {t('social.google')}
      </button>
    </div>
  );
};

export default SocialLogin;
