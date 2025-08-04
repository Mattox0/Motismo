import { render, screen, waitFor } from '@testing-library/react';
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

jest.mock('@/services/game.service', () => ({
  useCreateGameUserMutation: jest.fn(() => [jest.fn()]),
}));

jest.mock('@/utils/toast', () => ({
  showToast: {
    error: jest.fn(),
  },
}));

jest.mock('../SplashScreen', () => ({
  SplashScreen: () => <div data-testid="splash-screen" />,
}));

global.fetch = jest.fn();

describe('PlayerAccess', () => {
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ code: 'test-code' });
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Test User', id: 'user-id' }, expires: '2024-12-31' },
      status: 'authenticated',
      update: jest.fn(),
    } as any);

    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {}));
  });

  it('renders the form labels and the Rejoindre button after loading', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          properties: {
            eyes: { items: { enum: ['e1', 'e2'] } },
            mouth: { items: { enum: ['m1', 'm2'] } },
          },
        }),
    });

    render(<PlayerAccess />);

    await waitFor(() => {
      expect(screen.getByText('Pseudo')).toBeInTheDocument();
      expect(screen.getByText('Choisissez votre avatar')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Rejoindre' })).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<PlayerAccess />);

    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
  });

  it('loads avatar options from API', async () => {
    const mockSchema = {
      properties: {
        eyes: { items: { enum: ['eyes1', 'eyes2'] } },
        mouth: { items: { enum: ['mouth1', 'mouth2'] } },
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSchema),
    });

    render(<PlayerAccess />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.dicebear.com/9.x/fun-emoji/schema.json'
      );
    });
  });
});
