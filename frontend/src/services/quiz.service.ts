import { Quizz } from '@/../../backend/src/quizz/quizz.entity';

import { baseApi } from '@/services/base.service';
import { QueryTags } from '@/types/QueryTags';

export const quizApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getQuiz: builder.query<Quizz[], void>({
      query: () => '/quizz',
      providesTags: [QueryTags.QUIZ],
    }),
    createQuizz: builder.mutation<Quizz, FormData>({
      query: (formData: FormData) => ({
        url: '/quizz',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [QueryTags.QUIZ],
    }),
    getOneQuiz: builder.query<Quizz, string>({
      query: (id: string) => `/quizz/${id}`,
      providesTags: [QueryTags.QUIZ],
    }),
  }),
});

export const { useGetQuizQuery, useCreateQuizzMutation, useGetOneQuizQuery } = quizApi;
