'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/forms/Button';

export const AskCreateSection: FC = () => {
  const { t } = useTranslation();
  return (
    <div className="ask-create-section">
      <AnimatePresence>
        <motion.div
          className="ask-create-section__container"
          key="ask-create-section"
          initial={{ y: 50 }}
          animate={{
            y: [0, -10, 0, -10, 0],
          }}
          exit={{ opacity: 0, y: -50 }}
          whileHover={{
            y: 0,
            transition: {
              duration: 0.2,
            },
          }}
          transition={{
            duration: 1,
            y: {
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          <span className="ask-create-section__tag">{t('profile.ask_create_section.tag')}</span>
          <h2 className="ask-create-section__text">{t('profile.ask_create_section.text')}</h2>
          <div className="ask-create-section__buttons">
            <Button variant="primary">{t('profile.ask_create_section.create_quizz')}</Button>
            <Button variant="secondary">{t('profile.ask_create_section.create_cards')}</Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
