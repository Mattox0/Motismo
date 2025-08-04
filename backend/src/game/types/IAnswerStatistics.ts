export interface IChoiceStatistic {
  choiceId: string;
  choiceText: string;
  isCorrect: boolean;
  count: number;
  percentage: number;
  users: {
    id: string;
    name: string;
    avatar?: string;
  }[];
}

export interface IAnswerStatistics {
  questionId: string;
  questionTitle: string;
  totalResponses: number;
  choices: IChoiceStatistic[];
}
