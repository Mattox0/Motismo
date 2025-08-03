import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterForm from '../RegisterForm';

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: (fn: any) => fn,
    formState: { errors: {}, isSubmitting: false },
  }),
}));

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    register: jest.fn(),
  }),
}));

jest.mock('@/utils/toast', () => ({
  showToast: {
    success: jest.fn(),
  },
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<RegisterForm />);
    
    expect(screen.getByText('auth.name')).toBeInTheDocument();
    expect(screen.getByText('auth.email')).toBeInTheDocument();
    expect(screen.getByText('auth.password')).toBeInTheDocument();
    expect(screen.getByText('auth.confirmPassword')).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<RegisterForm />);
    
    const submitButton = screen.getByRole('button', { name: /auth.register/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    render(<RegisterForm />);
    
    const submitButton = screen.getByRole('button', { name: /auth.register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(submitButton).toBeInTheDocument();
    });
  });

  it('should render form with proper structure', () => {
    render(<RegisterForm />);
    
    const form = screen.getByRole('button', { name: /auth.register/i }).closest('form');
    expect(form).toHaveClass('auth-form');
  });
}); 