'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/forms/Button';
import { CreateQuizForm } from '@/components/forms/CreateQuizForm';
import { Modal } from '@/components/Modal';
import { useCreateQuizzMutation } from '@/services/quiz.service';
import { IQuizzType } from '@/types/IQuizzType';
import { CreateQuizFormData } from '@/types/schemas/createQuizSchema';
import { showToast } from '@/utils/toast';

export const AskCreateSection: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<IQuizzType | null>(null);
  const [createQuizz] = useCreateQuizzMutation();

  const handleOpenModal = (type: IQuizzType) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedType(null);
  };

  const handleFormSubmit = async (data: CreateQuizFormData) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('quizzType', selectedType ?? IQuizzType.QUESTIONS);
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await createQuizz(formData).unwrap();

      showToast.success(
        response.quizzType === IQuizzType.QUESTIONS
          ? t('create_quiz.success.questions')
          : t('create_quiz.success.cards')
      );
      router.push(
        response.quizzType === IQuizzType.QUESTIONS
          ? `/quizz/${response.id}`
          : `/card/${response.id}`
      );
      handleCloseModal();
    } catch (error) {
      console.error('Error creating quiz:', error);
      showToast.error(t('create_quiz.error'));
    }
  };

  return (
    <>
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
              <Button variant="primary" onClick={() => handleOpenModal(IQuizzType.QUESTIONS)}>
                {t('profile.ask_create_section.create_quizz')}
              </Button>
              <Button variant="secondary" onClick={() => handleOpenModal(IQuizzType.CARDS)}>
                {t('profile.ask_create_section.create_cards')}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          selectedType === IQuizzType.QUESTIONS
            ? t('create_quiz.title.quiz')
            : t('create_quiz.title.cards')
        }
      >
        {selectedType && (
          <CreateQuizForm
            type={selectedType}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>
    </>
  );
};
