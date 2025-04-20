'use client';

import BoltIcon from '@mui/icons-material/Bolt';
import GroupsIcon from '@mui/icons-material/Groups';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Title } from '@/components/Title';

import { FonctionalityItem } from '../FonctionalityItem';

export const FonctionalitySection: FC = () => {
  const { t } = useTranslation();
  return (
    <div className="section fonctionality-section">
      <span className="fonctionality-tag">{t('fonctionality.tag')}</span>
      <Title variant="h2" className="">
        {t('fonctionality.title')}
      </Title>
      <div className="fonctionality-items">
        <FonctionalityItem
          title={t('fonctionality.item1.title')}
          description={t('fonctionality.item1.description')}
          icon={<BoltIcon className="fonctionality-item-icon-icon" />}
        />
        <FonctionalityItem
          title={t('fonctionality.item2.title')}
          description={t('fonctionality.item2.description')}
          icon={<GroupsIcon width="3rem" height="3rem" />}
        />
        <FonctionalityItem
          title={t('fonctionality.item3.title')}
          description={t('fonctionality.item3.description')}
          icon={<QueryStatsIcon width="3rem" height="3rem" />}
        />
      </div>
    </div>
  );
};
