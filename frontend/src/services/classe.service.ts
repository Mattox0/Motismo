import { baseApi } from '@/services/base.service';
import { IClasse } from '@/types/model/IClasse';
import { QueryTags } from '@/types/QueryTags';

export const classeApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getClasses: builder.query<IClasse[], void>({
      query: () => '/classes/my-classes',
      providesTags: [QueryTags.CLASSE],
    }),
    getClasseByCode: builder.query<IClasse, { code: string }>({
      query: ({ code }) => `/classes/code/${code}`,
      providesTags: [QueryTags.CLASSE],
    }),
    getMyClass: builder.query<IClasse[], void>({
      query: () => '/classes/me',
      providesTags: [QueryTags.CLASSE],
    }),
    createClasse: builder.mutation<IClasse, { name: string }>({
      query: data => ({
        url: '/classes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [QueryTags.CLASSE],
    }),
    updateClasse: builder.mutation<IClasse, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/classes/${id}`,
        method: 'PUT',
        body: { name },
      }),
      invalidatesTags: [QueryTags.CLASSE],
    }),
    deleteClasse: builder.mutation<void, string>({
      query: id => ({
        url: `/classes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [QueryTags.CLASSE],
    }),
    joinClasseByCode: builder.mutation<IClasse, { code: string }>({
      query: ({ code }) => ({
        url: `/classes/join/${code}`,
        method: 'POST',
      }),
      invalidatesTags: [QueryTags.CLASSE],
    }),
    leaveClass: builder.mutation<void, void>({
      query: () => ({
        url: '/classes/leave',
        method: 'DELETE',
      }),
    }),
    removeStudentFromClass: builder.mutation<IClasse, { classeId: string; studentId: string }>({
      query: ({ classeId, studentId }) => ({
        url: `/classes/${classeId}/students/${studentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [QueryTags.CLASSE],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useGetClasseByCodeQuery,
  useGetMyClassQuery,
  useCreateClasseMutation,
  useUpdateClasseMutation,
  useDeleteClasseMutation,
  useJoinClasseByCodeMutation,
  useLeaveClassMutation,
  useRemoveStudentFromClassMutation,
} = classeApi;
