import { AllQuestion } from '@/../../backend/src/question/types/AllQuestion';

import { baseApi } from '@/services/base.service';
import { QueryTags } from '@/types/QueryTags';

import { Question } from '../../../backend/src/question/question.entity';

export const questionApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getQuestions: builder.query<AllQuestion[], string>({
      query: (quizzId: string) => `quizz/${quizzId}/questions`,
      providesTags: [QueryTags.QUIZ],
    }),
    addQuestion: builder.mutation<Question, { quizzId: string; question: FormData }>({
      query: ({ quizzId, question }) => ({
        url: `quizz/${quizzId}/questions/choice`,
        method: 'POST',
        body: question,
      }),
      invalidatesTags: [QueryTags.QUIZ],
    }),
    updateQuestion: builder.mutation<
      Question,
      { quizzId: string; questionId: string; question: FormData }
    >({
      query: ({ quizzId, questionId, question }) => ({
        url: `quizz/${quizzId}/questions/${questionId}/choice`,
        method: 'PUT',
        body: question,
      }),
      invalidatesTags: [QueryTags.QUIZ],
    }),
  }),
});

export const { useGetQuestionsQuery, useAddQuestionMutation, useUpdateQuestionMutation } =
  questionApi;
