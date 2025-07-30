import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getSession } from 'next-auth/react';

import { QueryTags } from '@/types/QueryTags';

export const baseApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: async headers => {
      const session = await getSession();
      if (session?.accessToken) {
        headers.set('Authorization', `Bearer ${session.accessToken}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: [QueryTags.QUIZ, QueryTags.GAME],
  endpoints: () => ({}),
});
