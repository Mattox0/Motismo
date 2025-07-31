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
        url: `quizz/${quizzId}/questions`,
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
        url: `quizz/${quizzId}/questions/${questionId}`,
        method: 'PUT',
        body: question,
      }),
      invalidatesTags: [QueryTags.QUIZ],
    }),
    deleteQuestion: builder.mutation<void, { quizzId: string; questionId: string }>({
      query: ({ quizzId, questionId }) => ({
        url: `quizz/${quizzId}/questions/${questionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [QueryTags.QUIZ],
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = questionApi;
