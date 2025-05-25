import { Quizz } from '@/../../backend/src/quizz/quizz.entity';

import { baseApi } from '@/services/base.service';
import { QueryTags } from '@/types/QueryTags';

export const quizApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getQuiz: builder.query<Quizz[], void>({
      query: () => '/quizz',
      providesTags: [QueryTags.QUIZ],
    }),
  }),
});

export const { useGetQuizQuery } = quizApi;
