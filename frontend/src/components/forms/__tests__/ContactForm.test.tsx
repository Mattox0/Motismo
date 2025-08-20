import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';

import { ContactForm } from '../ContactForm';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sujet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /envoyer le message/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const submitButton = screen.getByRole('button', { name: /envoyer le message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/le prénom doit contenir au moins 2 caractères/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/le nom doit contenir au moins 2 caractères/i)).toBeInTheDocument();
      expect(screen.getByText(/veuillez entrer une adresse email valide/i)).toBeInTheDocument();
      expect(screen.getByText(/le sujet doit contenir au moins 5 caractères/i)).toBeInTheDocument();
      expect(
        screen.getByText(/le message doit contenir au moins 10 caractères/i)
      ).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /envoyer le message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/veuillez entrer une adresse email valide/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short names', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const firstNameInput = screen.getByLabelText(/prénom/i);
    const lastNameInput = screen.getByLabelText(/nom/i);

    await user.type(firstNameInput, 'a');
    await user.type(lastNameInput, 'b');

    const submitButton = screen.getByRole('button', { name: /envoyer le message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/le prénom doit contenir au moins 2 caractères/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/le nom doit contenir au moins 2 caractères/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid characters in names', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const firstNameInput = screen.getByLabelText(/prénom/i);
    const lastNameInput = screen.getByLabelText(/nom/i);

    await user.type(firstNameInput, 'John123');
    await user.type(lastNameInput, 'Doe456');

    const submitButton = screen.getByRole('button', { name: /envoyer le message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes/i
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(/le nom ne peut contenir que des lettres, espaces, tirets et apostrophes/i)
      ).toBeInTheDocument();
    });
  });

  it('submits form successfully with valid data', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Fill in all required fields with valid data
    await user.type(screen.getByLabelText(/prénom/i), 'Jean');
    await user.type(screen.getByLabelText(/nom/i), 'Dupont');
    await user.type(screen.getByLabelText(/email/i), 'jean.dupont@example.com');
    await user.type(screen.getByLabelText(/sujet/i), 'Question sur le service');
    await user.type(
      screen.getByLabelText(/message/i),
      "Bonjour, j'ai une question concernant votre service. Pouvez-vous m'aider ?"
    );

    const submitButton = screen.getByRole('button', { name: /envoyer le message/i });
    await user.click(submitButton);

    // Wait for the form submission to complete
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.'
      );
    });

    // Check that form is reset
    await waitFor(() => {
      expect(screen.getByLabelText(/prénom/i)).toHaveValue('');
      expect(screen.getByLabelText(/nom/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
      expect(screen.getByLabelText(/sujet/i)).toHaveValue('');
      expect(screen.getByLabelText(/message/i)).toHaveValue('');
    });
  });

  it('handles form submission error', async () => {
    const user = userEvent.setup();

    // Mock console.error to avoid noise in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<ContactForm />);

    // Fill in all required fields with valid data
    await user.type(screen.getByLabelText(/prénom/i), 'Jean');
    await user.type(screen.getByLabelText(/nom/i), 'Dupont');
    await user.type(screen.getByLabelText(/email/i), 'jean.dupont@example.com');
    await user.type(screen.getByLabelText(/sujet/i), 'Question sur le service');
    await user.type(
      screen.getByLabelText(/message/i),
      "Bonjour, j'ai une question concernant votre service. Pouvez-vous m'aider ?"
    );

    const submitButton = screen.getByRole('button', { name: /envoyer le message/i });
    await user.click(submitButton);

    // Simulate an error by mocking the setTimeout to throw
    jest.spyOn(global, 'setTimeout').mockImplementationOnce(() => {
      throw new Error('Network error');
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer."
      );
    });

    consoleSpy.mockRestore();
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Fill in all required fields with valid data
    await user.type(screen.getByLabelText(/prénom/i), 'Jean');
    await user.type(screen.getByLabelText(/nom/i), 'Dupont');
    await user.type(screen.getByLabelText(/email/i), 'jean.dupont@example.com');
    await user.type(screen.getByLabelText(/sujet/i), 'Question sur le service');
    await user.type(
      screen.getByLabelText(/message/i),
      "Bonjour, j'ai une question concernant votre service. Pouvez-vous m'aider ?"
    );

    const submitButton = screen.getByRole('button', { name: /envoyer le message/i });
    await user.click(submitButton);

    // Check that button shows loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /envoi en cours/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /envoi en cours/i })).toBeDisabled();
    });
  });
});
