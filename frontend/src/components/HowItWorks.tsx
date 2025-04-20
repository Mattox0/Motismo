'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Step, { Step as StepType } from './Step';

const HowItWorks = () => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 0.3, 1], ['0%', '100%', '100%']);

  const steps: StepType[] = [
    {
      number: 1,
      title: t('howItWorks.steps.1.title'),
      description: t('howItWorks.steps.1.description'),
    },
    {
      number: 2,
      title: t('howItWorks.steps.2.title'),
      description: t('howItWorks.steps.2.description'),
    },
    {
      number: 3,
      title: t('howItWorks.steps.3.title'),
      description: t('howItWorks.steps.3.description'),
    },
  ];

  return (
    <section className="how-it-works">
      <div className="how-it-works-container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
          className="how-it-works-header"
        >
          <h2>{t('howItWorks.title')}</h2>
          <h3>{t('howItWorks.subtitle')}</h3>
        </motion.div>

        <div ref={containerRef} className="how-it-works-timeline">
          <motion.div
            className="how-it-works-timeline-line"
            style={{
              height: lineHeight,
              originY: 0,
            }}
          />

          {steps.map((step, index) => (
            <Step key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
