'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import DrawIcon from '@mui/icons-material/Draw';
import LoginIcon from '@mui/icons-material/LoginRounded';
import PeopleIcon from '@mui/icons-material/PeopleOutlineRounded';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { CallToAction } from '@/components/CallToAction';
import { Button } from '@/components/forms/Button';
import Input from '@/components/forms/Input';
import { createQuizCodeSchema } from '@/types/schemas/createQuizCodeSchema';

export const HeroSection: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const schema = createQuizCodeSchema(t);
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    router.push(`/quiz/${data.code.toUpperCase()}`);
  };

  return (
    <div className="hero">
      <h1 className="hero-title">{t('hero.title')}</h1>
      <h2 className="hero-subtitle">{t('hero.subtitle')}</h2>
      <div className="hero-ctas">
        <CallToAction
          variant="primary"
          icon={<PeopleIcon color="primary" />}
          title={t('hero.join.quizz')}
          description={t('hero.join.quizzDescription')}
          onSubmit={handleSubmit(onSubmit)}
          button={
            <Button variant="primary" startIcon={<LoginIcon />} type="submit">
              {t('hero.join.quizz')}
            </Button>
          }
          input={
            <Input
              label={t('hero.join.quizzInput')}
              placeholder={t('hero.join.quizzInputPlaceholder')}
              error={errors.code?.message}
              registration={register('code')}
              maxLength={6}
              autoComplete="off"
            />
          }
        />
        <CallToAction
          variant="secondary"
          icon={<DrawIcon color="secondary" />}
          title={t('hero.create.quizz')}
          description={t('hero.create.quizzDescription')}
          button={
            <Button variant="secondary" startIcon={<LoginIcon />} onClick={() => {}}>
              {t('hero.create.quizz')}
            </Button>
          }
        />
      </div>
    </div>
  );
};
