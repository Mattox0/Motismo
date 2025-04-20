'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepProps {
  step: Step;
  index: number;
}

const Step = ({ step, index }: StepProps) => {
  const stepRef = useRef(null);
  const isInView = useInView(stepRef, {
    once: false,
    amount: 0.5,
  });

  return (
    <motion.div
      ref={stepRef}
      initial={{
        opacity: 0,
        x: index % 2 === 0 ? -100 : 100,
        y: 20,
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              x: 0,
              y: 0,
            }
          : {
              opacity: 0,
              x: index % 2 === 0 ? -100 : 100,
              y: 20,
            }
      }
      transition={{
        duration: 0.8,
        ease: 'easeOut',
      }}
      className={`step ${index % 2 === 1 ? 'step--reverse' : ''}`}
    >
      <div className="step-content">
        <div className={`step-text ${index % 2 === 1 ? 'step-text-right' : ''}`}>
          <motion.h4
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.6,
              delay: 0.3,
              ease: 'easeOut',
            }}
          >
            {step.title}
          </motion.h4>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.6,
              delay: 0.5,
              ease: 'easeOut',
            }}
          >
            {step.description}
          </motion.p>
        </div>
      </div>

      <motion.div
        className="step-number"
        initial={{ scale: 0, rotate: -180 }}
        animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
        }}
      >
        <motion.div
          className="step-number-circle"
          whileHover={{
            scale: 1.2,
            rotate: 360,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 10,
          }}
        >
          {step.number}
        </motion.div>
      </motion.div>

      <div className="step-content" />
    </motion.div>
  );
};

export default Step;
