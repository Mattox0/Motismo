import { setupStore } from '../store';

jest.mock('@/services/base.service', () => {
  const INC = 'TEST/INC';

  const reducerPath = 'api';
  const reducer = (state = { value: 0 }, action: any) =>
    action.type === INC ? { value: state.value + 1 } : state;

  const seen: any[] = [];
  const middleware = () => (next: any) => (action: any) => {
    seen.push(action);
    return next(action);
  };

  return {
    baseApi: { reducerPath, reducer, middleware },
    __INC: INC,
    __SEEN: seen,
  };
});

describe('store setup', () => {
  it('creates a store with the api reducer mounted', () => {
    const store = setupStore();
    const state = store.getState() as any;

    expect(state).toHaveProperty('api');
    expect(state.api).toEqual({ value: 0 });
  });

  it('updates api slice via reducer and runs api middleware', () => {
    const store = setupStore();
    const { __INC, __SEEN } = jest.requireMock('@/services/base.service');

    const action = { type: __INC };
    store.dispatch(action);

    const state = store.getState() as any;
    expect(state.api.value).toBe(1);

    expect(__SEEN.length).toBeGreaterThan(0);
    expect(__SEEN.findLast((a: any) => a.type === __INC)).toEqual(action);
  });
});
