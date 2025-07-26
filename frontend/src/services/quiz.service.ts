import { baseApi } from '@/services/base.service';
import { IGame } from '@/types/model/IGame';
import { IQuizz } from '@/types/model/IQuizz';
import { QueryTags } from '@/types/QueryTags';

export const quizApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getQuiz: builder.query<IQuizz[], void>({
      query: () => '/quizz',
      providesTags: [QueryTags.QUIZ],
    }),
    createQuizz: builder.mutation<IQuizz, FormData>({
      query: (formData: FormData) => ({
        url: '/quizz',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [QueryTags.QUIZ],
    }),
    getOneQuiz: builder.query<IQuizz, string>({
      query: (id: string) => `/quizz/${id}`,
      providesTags: [QueryTags.QUIZ],
    }),
    getQuizByCode: builder.query<IQuizz, string>({
      query: (code: string) => `/quizz/code/${code}`,
      providesTags: [QueryTags.QUIZ],
    }),
    createGame: builder.mutation<IGame, string>({
      query: (id: string) => ({
        url: `/quizz/${id}/game`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetQuizQuery,
  useCreateQuizzMutation,
  useGetOneQuizQuery,
  useGetQuizByCodeQuery,
  useCreateGameMutation,
} = quizApi;
