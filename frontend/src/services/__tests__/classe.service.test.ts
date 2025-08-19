import { renderHook, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { classeApi } from '../classe.service';

const server = setupServer(
  rest.get(`${process.env.NEXT_PUBLIC_API_URL}/classes`, (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          name: 'Class 1',
          code: 'ABC123',
          students: [],
          teachers: [],
        },
        {
          id: '2',
          name: 'Class 2',
          code: 'DEF456',
          students: [],
          teachers: [],
        },
      ])
    );
  }),
  rest.post(`${process.env.NEXT_PUBLIC_API_URL}/classes`, (req, res, ctx) => {
    return res(
      ctx.json({
        id: '3',
        name: 'New Class',
        code: 'GHI789',
        students: [],
        teachers: [],
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('classeApi', () => {
  it('should fetch classes successfully', async () => {
    const { result } = renderHook(() => classeApi.useGetClassesQuery());

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].name).toBe('Class 1');
      expect(result.current.data?.[1].name).toBe('Class 2');
    });
  });

  it('should create a class successfully', async () => {
    const { result } = renderHook(() => classeApi.useCreateClasseMutation());

    const [createClasse] = result.current;

    const response = await createClasse({ name: 'New Class' }).unwrap();

    expect(response.name).toBe('New Class');
    expect(response.code).toBe('GHI789');
  });
});





