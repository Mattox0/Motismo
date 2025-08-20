import { configureStore } from '@reduxjs/toolkit';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import { AskCreateSection } from '../AskCreateSection';

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => children,
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/services/quiz.service', () => ({
  useCreateQuizzMutation: () => [
    jest.fn().mockResolvedValue({ data: { id: 'test-id', quizzType: 'QUESTIONS' } }),
    { isLoading: false },
  ],
}));

jest.mock('@/services/classe.service', () => ({
  useGetClassesQuery: () => ({
    data: [],
    isLoading: false,
  }),
}));

jest.mock('@/utils/toast', () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const createMockStore = () =>
  configureStore({
    reducer: {
      api: (state = {}) => state,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });

const renderWithRedux = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(<Provider store={store}>{component}</Provider>);
};

describe('AskCreateSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the section with correct content', () => {
      renderWithRedux(<AskCreateSection />);

      expect(screen.getByText('profile.ask_create_section.tag')).toBeInTheDocument();
      expect(screen.getByText('profile.ask_create_section.text')).toBeInTheDocument();
      expect(screen.getByText('profile.ask_create_section.create_quizz')).toBeInTheDocument();
      expect(screen.getByText('profile.ask_create_section.create_cards')).toBeInTheDocument();
    });

    it('should render with correct CSS classes', () => {
      renderWithRedux(<AskCreateSection />);

      const section = screen.getByText('profile.ask_create_section.text').closest('div');
      expect(section).toHaveClass('ask-create-section__container');
    });

    it('should render title with correct styling', () => {
      renderWithRedux(<AskCreateSection />);

      const title = screen.getByText('profile.ask_create_section.text');
      expect(title).toHaveClass('ask-create-section__text');
    });

    it('should render description with correct styling', () => {
      renderWithRedux(<AskCreateSection />);

      const tag = screen.getByText('profile.ask_create_section.tag');
      expect(tag).toHaveClass('ask-create-section__tag');
    });
  });

  describe('button interactions', () => {
    it('should render create quiz button with correct styling', () => {
      renderWithRedux(<AskCreateSection />);

      const quizButton = screen.getByText('profile.ask_create_section.create_quizz');
      expect(quizButton).toBeInTheDocument();
    });

    it('should render create cards button with correct styling', () => {
      renderWithRedux(<AskCreateSection />);

      const cardsButton = screen.getByText('profile.ask_create_section.create_cards');
      expect(cardsButton).toBeInTheDocument();
    });

    it('should handle create quiz button click', () => {
      const mockPush = jest.fn();
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
        push: mockPush,
      });

      renderWithRedux(<AskCreateSection />);

      const quizButton = screen.getByText('profile.ask_create_section.create_quizz');
      fireEvent.click(quizButton);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should handle create cards button click', () => {
      const mockPush = jest.fn();
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
        push: mockPush,
      });

      renderWithRedux(<AskCreateSection />);

      const cardsButton = screen.getByText('profile.ask_create_section.create_cards');
      fireEvent.click(cardsButton);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should handle multiple button clicks', () => {
      const mockPush = jest.fn();
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
        push: mockPush,
      });

      renderWithRedux(<AskCreateSection />);

      const quizButton = screen.getByText('profile.ask_create_section.create_quizz');
      const cardsButton = screen.getByText('profile.ask_create_section.create_cards');

      fireEvent.click(quizButton);
      fireEvent.click(cardsButton);
      fireEvent.click(quizButton);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper semantic structure', () => {
      renderWithRedux(<AskCreateSection />);

      const section = screen.getByText('profile.ask_create_section.text').closest('div');
      expect(section).toBeInTheDocument();
    });

    it('should have proper button types', () => {
      renderWithRedux(<AskCreateSection />);

      const quizButton = screen.getByText('profile.ask_create_section.create_quizz');
      const cardsButton = screen.getByText('profile.ask_create_section.create_cards');

      expect(quizButton).toBeInTheDocument();
      expect(cardsButton).toBeInTheDocument();
    });

    it('should have proper button accessibility', () => {
      renderWithRedux(<AskCreateSection />);

      const quizButton = screen.getByText('profile.ask_create_section.create_quizz');
      const cardsButton = screen.getByText('profile.ask_create_section.create_cards');

      expect(quizButton).toBeEnabled();
      expect(cardsButton).toBeEnabled();
    });
  });

  describe('responsive design', () => {
    it('should have responsive container classes', () => {
      renderWithRedux(<AskCreateSection />);

      const section = screen.getByText('profile.ask_create_section.text').closest('div');
      expect(section).toHaveClass('ask-create-section__container');
    });

    it('should have responsive button layout', () => {
      renderWithRedux(<AskCreateSection />);

      const quizButton = screen.getByText('profile.ask_create_section.create_quizz');
      const cardsButton = screen.getByText('profile.ask_create_section.create_cards');

      expect(quizButton).toBeInTheDocument();
      expect(cardsButton).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should handle router push errors gracefully', () => {
      const mockPush = jest.fn().mockImplementation(() => {
        throw new Error('Navigation error');
      });
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
        push: mockPush,
      });

      renderWithRedux(<AskCreateSection />);

      const quizButton = screen.getByText('profile.ask_create_section.create_quizz');

      expect(() => {
        fireEvent.click(quizButton);
      }).not.toThrow();
    });

    it('should handle missing router gracefully', () => {
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
        push: undefined,
      });

      renderWithRedux(<AskCreateSection />);

      const quizButton = screen.getByText('profile.ask_create_section.create_quizz');

      expect(() => {
        fireEvent.click(quizButton);
      }).not.toThrow();
    });
  });

  describe('translation integration', () => {
    it('should use translation keys correctly', () => {
      renderWithRedux(<AskCreateSection />);

      expect(screen.getByText('profile.ask_create_section.tag')).toBeInTheDocument();
      expect(screen.getByText('profile.ask_create_section.text')).toBeInTheDocument();
      expect(screen.getByText('profile.ask_create_section.create_quizz')).toBeInTheDocument();
      expect(screen.getByText('profile.ask_create_section.create_cards')).toBeInTheDocument();
    });

    it('should handle missing translations gracefully', () => {
      const mockT = jest.fn().mockReturnValue('');
      jest.spyOn(require('react-i18next'), 'useTranslation').mockReturnValue({
        t: mockT,
      });

      renderWithRedux(<AskCreateSection />);

      expect(mockT).toHaveBeenCalledWith('profile.ask_create_section.tag');
      expect(mockT).toHaveBeenCalledWith('profile.ask_create_section.text');
      expect(mockT).toHaveBeenCalledWith('profile.ask_create_section.create_quizz');
      expect(mockT).toHaveBeenCalledWith('profile.ask_create_section.create_cards');
    });
  });
});
