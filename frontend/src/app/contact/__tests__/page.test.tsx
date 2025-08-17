import { render, screen } from '@testing-library/react';
import Contact from '../page';

// Mock the ContactForm component
jest.mock('@/components/forms/ContactForm', () => ({
  ContactForm: () => <div data-testid="contact-form">Contact Form</div>,
}));

// Mock the GlobalLayout component
jest.mock('@/layout/GlobalLayout', () => ({
  GlobalLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="global-layout">{children}</div>
  ),
}));

describe('Contact Page', () => {
  it('renders the contact page with header and form', () => {
    render(<Contact />);

    // Check main title and subtitle
    expect(screen.getByText('Besoin d\'aide ?')).toBeInTheDocument();
    expect(
      screen.getByText(/Notre équipe est là pour vous accompagner/)
    ).toBeInTheDocument();

    // Check that the contact form is rendered
    expect(screen.getByTestId('contact-form')).toBeInTheDocument();
  });

  it('uses GlobalLayout wrapper', () => {
    render(<Contact />);
    expect(screen.getByTestId('global-layout')).toBeInTheDocument();
  });

  it('has the correct page structure', () => {
    render(<Contact />);
    
    // Check that the main container exists
    const contactPage = screen.getByText('Besoin d\'aide ?').closest('.contact-page');
    expect(contactPage).toBeInTheDocument();
    
    // Check that the form container exists
    const formContainer = screen.getByTestId('contact-form').closest('.contact-form-container');
    expect(formContainer).toBeInTheDocument();
  });
});
