import LoginIcon from '@mui/icons-material/LoginRounded';
import PersonAddIcon from '@mui/icons-material/PersonAddRounded';
import { useTranslation } from 'react-i18next';

import { AuthTab } from '@/types/AuthTab';

interface AuthNavProps {
  activeTab: 'login' | 'register';
  onTabChange: (_tab: AuthTab) => void;
}

const AuthNav: React.FC<AuthNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <nav className="auth-nav">
      <button
        className={`nav-item ${activeTab === 'login' ? 'active' : ''}`}
        onClick={() => onTabChange('login')}
      >
        <LoginIcon />
        {t('auth.login')}
      </button>
      <button
        className={`nav-item ${activeTab === 'register' ? 'active' : ''}`}
        onClick={() => onTabChange('register')}
      >
        <PersonAddIcon />
        {t('auth.register')}
      </button>
    </nav>
  );
};

export default AuthNav;
