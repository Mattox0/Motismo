import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudIcon from '@mui/icons-material/Cloud';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { TFunction } from 'i18next';

import { IQuestionType } from '@/types/QuestionType';

export const isChoiceBasedQuestion = (questionType: IQuestionType): boolean => {
  return [
    IQuestionType.MULTIPLE_CHOICES,
    IQuestionType.UNIQUE_CHOICES,
    IQuestionType.BOOLEAN_CHOICES,
  ].includes(questionType);
};

export const isMultipleChoiceQuestion = (questionType: IQuestionType): boolean => {
  return questionType === IQuestionType.MULTIPLE_CHOICES;
};

export const isSingleChoiceQuestion = (questionType: IQuestionType): boolean => {
  return [IQuestionType.UNIQUE_CHOICES, IQuestionType.BOOLEAN_CHOICES].includes(questionType);
};

export const isBooleanQuestion = (questionType: IQuestionType): boolean => {
  return questionType === IQuestionType.BOOLEAN_CHOICES;
};

export const getQuestionTypeOptions = (t: TFunction) => [
  {
    value: IQuestionType.MULTIPLE_CHOICES,
    label: t('question.types.multipleChoices'),
    icon: <CheckBoxIcon />,
    description: t('question.types.multipleChoicesDesc'),
  },
  {
    value: IQuestionType.UNIQUE_CHOICES,
    label: t('question.types.uniqueChoice'),
    icon: <RadioButtonCheckedIcon />,
    description: t('question.types.uniqueChoiceDesc'),
  },
  {
    value: IQuestionType.BOOLEAN_CHOICES,
    label: t('question.types.boolean'),
    icon: <CheckCircleIcon />,
    description: t('question.types.booleanDesc'),
  },
  {
    value: IQuestionType.WORD_CLOUD,
    label: t('question.types.wordCloud'),
    icon: <CloudIcon />,
    description: t('question.types.wordCloudDesc'),
  },
  {
    value: IQuestionType.MATCHING,
    label: t('question.types.matching'),
    icon: <CompareArrowsIcon />,
    description: t('question.types.matchingDesc'),
  },
];
