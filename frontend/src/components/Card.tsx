import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { formatDate } from '@/utils/formatDate';

import { Button } from './forms/Button';

export interface ICardProps {
  image?: string;
  badge: string;
  title: string;
  creationDate: Date;
  onEditClick?: () => void;
  onPresentationClick: () => void;
  onCardClick?: () => void;
}

export const Card: FC<ICardProps> = ({
  image,
  badge,
  title,
  onEditClick,
  onPresentationClick,
  onCardClick,
  creationDate,
}) => {
  const { t } = useTranslation();
  return (
    <div className="card">
      <div
        className="card-header"
        onClick={onCardClick}
        style={{ cursor: onCardClick ? 'pointer' : 'default' }}
      >
        <img className="card-header__image" src={image ?? ''} alt={title} />
        <span className="card-header__badge">{badge}</span>
        {onCardClick && (
          <div className="card-header__overlay">
            <span className="card-header__overlay-text">Modifier</span>
          </div>
        )}
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <div className="card-content__date">
          <EventNoteOutlinedIcon />
          <p className="card-content__date-text">{formatDate(creationDate)}</p>
        </div>
        <div className="card-content__buttons">
          {onEditClick && (
            <Button variant="primary" onClick={onEditClick}>
              {t('card.button.primary')}
            </Button>
          )}
          <Button variant="secondary" onClick={onPresentationClick}>
            {t('card.button.secondary')}
          </Button>
        </div>
      </div>
    </div>
  );
};
