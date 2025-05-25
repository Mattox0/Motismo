import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { formatDate } from '@/utils/formatDate';

import { Button } from './forms/Button';

export interface CardProps {
  image?: string;
  nbQuestions: number;
  title: string;
  creationDate: Date;
  onEditClick: () => void;
  onPresentationClick: () => void;
}

export const Card: FC<CardProps> = ({
  image,
  nbQuestions,
  title,
  onEditClick,
  onPresentationClick,
  creationDate,
}) => {
  const { t } = useTranslation();
  return (
    <div className="card">
      <div className="card-header">
        <img className="card-header__image" src={image ?? ''} alt={title} />
        <span className="card-header__badge">
          {t('card.questions', { nbQuestions: nbQuestions })}
        </span>
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <div>
          <EventNoteOutlinedIcon />
          <p>{formatDate(creationDate)}</p>
        </div>
        <div>
          <Button variant="primary" onClick={onEditClick}>
            {t('card.button.primary')}
          </Button>
          <Button variant="secondary" onClick={onPresentationClick}>
            {t('card.button.secondary')}
          </Button>
        </div>
      </div>
    </div>
  );
};
