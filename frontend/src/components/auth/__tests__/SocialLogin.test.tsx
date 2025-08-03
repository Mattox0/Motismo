/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent } from '@testing-library/react';
import { signIn } from 'next-auth/react';

import SocialLogin from '../SocialLogin';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

describe('SocialLogin component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render Google login button', () => {
    render(<SocialLogin />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Google');
    expect(button).toHaveClass('social-button');
  });

  it('should render Google icon', () => {
    render(<SocialLogin />);

    const icon = screen.getByText('G');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('google-icon');
  });

  it('should call signIn with google provider when button is clicked', () => {
    render(<SocialLogin />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith('google');
  });

  it('should have correct CSS classes', () => {
    render(<SocialLogin />);

    const container = screen.getByRole('button').closest('.social-login');
    expect(container).toBeInTheDocument();
  });
});
