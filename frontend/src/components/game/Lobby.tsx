import StartIcon from '@mui/icons-material/Start';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';

import { useGame } from '@/providers/GameProvider';
import { IQuizz } from '@/types/model/IQuizz';

import { Button } from '../forms/Button';

import { Avatar } from './Avatar';

interface ILobbyProps {
  quizz: IQuizz;
  code: string;
  presentation?: boolean;
  handleClick?: () => void;
}

export const Lobby: FC<ILobbyProps> = ({
  quizz,
  code,
  presentation = false,
  handleClick = () => {},
}) => {
  const { t } = useTranslation();
  const { users } = useGame();

  const qrCodeValue = `${window.location.origin}/game/${code}`;

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">{quizz?.title}</h1>
      <div className="lobby-main-section">
        <div className="lobby-code-section">
          <p className="lobby-invite-text">
            {t('game.lobby.joinText')}
            <span className="lobby-url">{window.location.origin}</span>
          </p>
          <span className="lobby-code">{code}</span>
        </div>
        <div className="lobby-qr-section">
          <QRCode
            size={180}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            value={qrCodeValue}
            viewBox={`0 0 256 256`}
          />
        </div>
      </div>
      {presentation ? (
        <Button
          variant="primary"
          startIcon={<StartIcon />}
          className="max-w-xs"
          onClick={handleClick}
        >
          {t('game.lobby.startQuiz')}
        </Button>
      ) : (
        <span className="lobby-info-message">{t('game.lobby.waitingPresenter')}</span>
      )}
      <div className="lobby-participants-section">
        <h2 className="lobby-participants-title">{t('game.lobby.participants')}</h2>
        <div className="lobby-participants-list">
          {users && users.length > 0 ? (
            users.map(user => (
              <Avatar key={user.id} avatar={user.avatar || ''} name={user.name} mode="lobby" />
            ))
          ) : (
            <div className="lobby-no-participants">{t('game.lobby.noParticipants')}</div>
          )}
        </div>
      </div>
    </div>
  );
};
