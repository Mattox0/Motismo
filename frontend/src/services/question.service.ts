import { AllQuestion } from '@/../../backend/src/question/types/AllQuestion';

import { baseApi } from '@/services/base.service';
import { QueryTags } from '@/types/QueryTags';

export const questionApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getQuestions: builder.query<AllQuestion[], string>({
      query: (quizzId: string) => `quiz/${quizzId}/questions`,
      providesTags: [QueryTags.QUESTION],
    }),
  }),
});

export const { useGetQuestionsQuery } = questionApi;
