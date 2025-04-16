'use client';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/hooks/useAuth';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { session, logout } = useAuth();
  const router = useRouter();

  const login = () => {
    router.push('/auth');
  };

  return (
    <nav>
      <div className="flex items-center gap-2">
        <RocketLaunchIcon />
        <h1>{t('app.name')}</h1>
      </div>
      {session ? <button onClick={logout}>Logout</button> : <button onClick={login}>Login</button>}
    </nav>
  );
};
