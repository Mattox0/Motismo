import { baseApi } from '@/services/base.service';
import { Card } from '@/types/model/Card';
import { QueryTags } from '@/types/QueryTags';

export const cardApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    createCard: builder.mutation<Card, { quizzId: string; formData: FormData }>({
      query: ({ quizzId, formData }) => ({
        url: `/quizz/${quizzId}/card`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [QueryTags.QUIZ],
    }),
    updateCard: builder.mutation<Card, { quizzId: string; cardId: string; formData: FormData }>({
      query: ({ quizzId, cardId, formData }) => ({
        url: `/quizz/${quizzId}/card/${cardId}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: [QueryTags.QUIZ],
    }),
  }),
});

export const { useCreateCardMutation, useUpdateCardMutation } = cardApi;
