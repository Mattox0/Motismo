import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React from 'react';

import { PlayerAccess } from '../PlayerAccess';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockCreateGameUser = jest.fn();
const mockUnwrap = jest.fn();

jest.mock('@/services/game.service', () => ({
  useCreateGameUserMutation: jest.fn(() => [jest.fn(() => ({ unwrap: jest.fn() }))]),
}));

const showToastError = jest.fn();

jest.mock('@/utils/toast', () => ({
  showToast: {
    error: (...args: any[]) => showToastError(...args),
  },
}));

jest.mock('../SplashScreen', () => ({
  SplashScreen: () => <div data-testid="splash-screen" />,
}));

jest.mock('../forms/Input', () => ({
  __esModule: true,
  default: ({ value, onChange, ...rest }: any) => (
    <input data-testid="pseudo-input" value={value} onChange={onChange} {...rest} />
  ),
}));

jest.mock('../forms/Button', () => ({
  Button: ({ children, ...rest }: any) => (
    <button data-testid="join-button" {...rest}>
      {children}
    </button>
  ),
}));

jest.mock('../forms/ColorPicker', () => ({
  ColorPicker: ({ color, setColor }: any) => (
    <input data-testid="color-picker" value={color} onChange={e => setColor(e.target.value)} />
  ),
}));

global.fetch = jest.fn();

describe('PlayerAccess - extended coverage', () => {
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ code: 'test-code' } as any);
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Test User', id: 'user-id' }, expires: '2025-12-31' },
      status: 'authenticated',
      update: jest.fn(),
    } as any);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          properties: {
            eyes: { items: { enum: ['e1', 'e2'] } },
            mouth: { items: { enum: ['m1', 'm2'] } },
          },
        }),
    } as any);
  });

  it('exposes form after loading and computes avatarUrl from indices', async () => {
    render(<PlayerAccess />);

    await waitFor(() => {
      expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Pseudo')).toBeInTheDocument();
    expect(screen.getByText('Choisissez votre avatar')).toBeInTheDocument();

    const img = screen.getByAltText('Avatar preview') as HTMLImageElement;
    expect(img.src).toContain('eyes=e1');
    expect(img.src).toContain('mouth=m1');
  });

  it('cycleIndex wraps correctly via prev/next buttons (eyes & mouth)', async () => {
    render(<PlayerAccess />);

    await waitFor(() => {
      expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
    });

    const img = screen.getByAltText('Avatar preview') as HTMLImageElement;

    const [eyesPrevBtn, mouthPrevBtn] = screen
      .getAllByRole('button')
      .filter(b => b.textContent === '<');
    const [eyesNextBtn, mouthNextBtn] = screen
      .getAllByRole('button')
      .filter(b => b.textContent === '>' || b.textContent === '›');

    fireEvent.click(eyesPrevBtn);
    expect(img.src).toContain('eyes=e2');

    fireEvent.click(eyesNextBtn);
    expect(img.src).toContain('eyes=e1');

    fireEvent.click(mouthPrevBtn);
    expect(img.src).toContain('mouth=m2');

    fireEvent.click(mouthNextBtn);
    expect(img.src).toContain('mouth=m1');
  });

  it('fetch error triggers toast error and stops loading', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    render(<PlayerAccess />);

    await waitFor(() => {
      expect(showToastError).toHaveBeenCalledWith(
        expect.stringContaining('Impossible de charger les options')
      );
    });

    expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
  });

  it('handleSubmit: missing name shows toast error', async () => {
    render(<PlayerAccess />);

    await waitFor(() => {
      expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
    });

    const input = screen.getByTestId('pseudo-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '   ' } });

    const joinBtn = screen.getByTestId('join-button');
    fireEvent.click(joinBtn);

    expect(showToastError).toHaveBeenCalledWith('Veuillez entrer un pseudo.');
  });

  it('handleSubmit: error path shows toast error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (require('@/services/game.service').useCreateGameUserMutation as jest.Mock).mockReturnValue([
      () => ({ unwrap: () => Promise.reject(new Error('boom')) }),
    ]);

    render(<PlayerAccess />);

    await waitFor(() => {
      expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
    });

    const input = screen.getByTestId('pseudo-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'PlayerY' } });

    const joinBtn = screen.getByTestId('join-button');
    fireEvent.click(joinBtn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
      expect(showToastError).toHaveBeenCalledWith('Impossible de rejoindre la partie');
    });

    consoleSpy.mockRestore();
  });
});
