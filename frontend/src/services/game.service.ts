import { baseApi } from '@/services/base.service';
import { IGameUser } from '@/types/model/IGameUser';

export interface ICreateGameUserRequest {
  name: string;
  avatar: string;
  externalId?: string;
}

export const gameApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    createGameUser: builder.mutation<IGameUser, { code: string; data: ICreateGameUserRequest }>({
      query: ({ code, data }) => ({
        url: `/game/${code}/gameUser`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useCreateGameUserMutation } = gameApi;
