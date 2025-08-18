'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AuthNav from '@/components/auth/AuthNav';
import LoginForm from '@/components/forms/LoginForm';
import RegisterForm from '@/components/forms/RegisterForm';
import AuthLayout from '@/layout/AuthLayout';
import { AuthTab } from '@/types/AuthTab';

export default function AuthPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const isLogin = activeTab === 'login';

  return (
    <AuthLayout>
      <AuthNav activeTab={activeTab} onTabChange={tab => setActiveTab(tab as AuthTab)} />

      <main className="auth-content">
        <h1 className="auth-title">{isLogin ? t('auth.welcome') : t('auth.registerWelcome')}</h1>
        <p className="auth-description">
          {isLogin ? t('auth.loginDescription') : t('auth.registerDescription')}
        </p>

        <div className="forms-container">
          <div className={`auth-form-wrapper login ${isLogin ? 'active' : ''}`}>
            <LoginForm />
          </div>

          <div className={`auth-form-wrapper register ${!isLogin ? 'active' : ''}`}>
            <RegisterForm />
          </div>
        </div>
      </main>
    </AuthLayout>
  );
}
