import { baseApi } from '@/services/base.service';
import { ICard } from '@/types/model/ICard';
import { QueryTags } from '@/types/QueryTags';

export const cardApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    createCard: builder.mutation<ICard, { quizzId: string; formData: FormData }>({
      query: ({ quizzId, formData }) => ({
        url: `/quizz/${quizzId}/card`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [QueryTags.QUIZ],
    }),
    updateCard: builder.mutation<ICard, { quizzId: string; cardId: string; formData: FormData }>({
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
