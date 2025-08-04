import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { useCard } from '@/providers/CardProvider';
import { useCreateCardMutation, useUpdateCardMutation } from '@/services/card.service';

import { CardPage } from '../CardPage';

jest.mock('@/providers/CardProvider', () => ({
  useCard: jest.fn(),
}));
jest.mock('@/services/card.service', () => ({
  useCreateCardMutation: jest.fn(),
  useUpdateCardMutation: jest.fn(),
}));
jest.mock('@/components/forms/CardForm', () => ({
  CardForm: ({ index, onSubmit }: any) => (
    <div data-testid={`card-form-${index}`}>
      {/* onSubmit simule la soumission de la carte */}
      <button
        data-testid={`submit-${index}`}
        onClick={() => onSubmit({ term: 'test', definition: 'test' }, 'card-id')}
      >
        Submit
      </button>
    </div>
  ),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('CardPage', () => {
  const mockUseCard = useCard as jest.MockedFunction<typeof useCard>;
  const mockCreateCard = jest.fn();
  const mockUpdateCard = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCreateCardMutation as jest.Mock).mockReturnValue([mockCreateCard]);
    (useUpdateCardMutation as jest.Mock).mockReturnValue([mockUpdateCard]);
  });

  it('affiche le loader quand isLoading est vrai', () => {
    mockUseCard.mockReturnValue({ quizz: null, isLoading: true } as any);

    const { container } = render(<CardPage quizzId="test-id" />);

    expect(container.querySelector('.parent-loader')).toBeInTheDocument();
  });

  it('affiche le titre et les formulaires de cartes quand les données sont là', () => {
    mockUseCard.mockReturnValue({
      quizz: {
        title: 'Test Quiz',
        cards: [
          { order: 1, id: 'card-1' },
          { order: 2, id: 'card-2' },
        ],
      },
      isLoading: false,
    } as any);

    render(<CardPage quizzId="test-id" />);

    expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    expect(screen.getByTestId('card-form-1')).toBeInTheDocument();
    expect(screen.getByTestId('card-form-2')).toBeInTheDocument();
  });

  it('appelle createCard au clic sur "Ajouter une carte"', () => {
    mockUseCard.mockReturnValue({
      quizz: { title: 'Test Quiz', cards: [] },
      isLoading: false,
    } as any);

    render(<CardPage quizzId="test-id" />);

    fireEvent.click(screen.getByText('Ajouter une carte'));

    expect(mockCreateCard).toHaveBeenCalledWith({
      quizzId: 'test-id',
      formData: expect.any(Object),
    });
  });

  it('appelle updateCard lors de la soumission d’une carte', async () => {
    mockUseCard.mockReturnValue({
      quizz: {
        title: 'Test Quiz',
        cards: [{ order: 1, id: 'card-1' }],
      },
      isLoading: false,
    } as any);

    mockUpdateCard.mockResolvedValue({ data: {} });

    render(<CardPage quizzId="test-id" />);

    fireEvent.click(screen.getByTestId('submit-1'));

    await waitFor(() => {
      expect(mockUpdateCard).toHaveBeenCalledWith({
        quizzId: 'test-id',
        cardId: 'card-id',
        formData: expect.any(FormData),
      });
    });
  });
});
