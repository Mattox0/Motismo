import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from '../LanguageSelector';

const mockChangeLanguage = jest.fn();
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'fr',
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render language options', () => {
    render(<LanguageSelector />);
    
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('should have correct default value', () => {
    render(<LanguageSelector />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('fr');
  });

  it('should handle language change', () => {
    render(<LanguageSelector />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'en' } });
    
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('should have correct CSS classes', () => {
    render(<LanguageSelector />);
    
    const container = screen.getByRole('combobox').closest('.language-selector');
    expect(container).toHaveClass('language-selector');
  });
}); 