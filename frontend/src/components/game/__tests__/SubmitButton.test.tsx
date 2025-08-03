import { render, screen, fireEvent } from '@testing-library/react';
import { SubmitButton } from '../SubmitButton';

describe('SubmitButton', () => {
  const defaultProps = {
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render submit text by default', () => {
    render(<SubmitButton {...defaultProps} />);
    
    expect(screen.getByText('Valider')).toBeInTheDocument();
  });

  it('should render custom submit text', () => {
    render(<SubmitButton {...defaultProps} submitText="Custom Submit" />);
    
    expect(screen.getByText('Custom Submit')).toBeInTheDocument();
  });

  it('should render submitted text when isSubmitted is true', () => {
    render(<SubmitButton {...defaultProps} isSubmitted={true} />);
    
    expect(screen.getByText('Réponse envoyée')).toBeInTheDocument();
  });

  it('should render custom submitted text', () => {
    render(<SubmitButton {...defaultProps} isSubmitted={true} submittedText="Custom Submitted" />);
    
    expect(screen.getByText('Custom Submitted')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<SubmitButton {...defaultProps} onClick={onClick} />);
    
    fireEvent.click(screen.getByText('Valider'));
    
    expect(onClick).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<SubmitButton {...defaultProps} disabled={true} />);
    
    const button = screen.getByText('Valider');
    expect(button).toBeDisabled();
  });

  it('should not be disabled by default', () => {
    render(<SubmitButton {...defaultProps} />);
    
    const button = screen.getByText('Valider');
    expect(button).not.toBeDisabled();
  });

  it('should have correct CSS classes', () => {
    render(<SubmitButton {...defaultProps} />);
    
    const button = screen.getByText('Valider');
    expect(button).toHaveClass('submit-btn');
  });

  it('should have custom CSS class', () => {
    render(<SubmitButton {...defaultProps} className="custom-class" />);
    
    const button = screen.getByText('Valider');
    expect(button).toHaveClass('submit-btn', 'custom-class');
  });
}); 