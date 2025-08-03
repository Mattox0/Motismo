import { render, screen } from '@testing-library/react';
import { FonctionalityItem } from '../FonctionalityItem';

describe('FonctionalityItem', () => {
  const defaultProps = {
    title: 'Test Functionality',
    description: 'This is a test functionality description',
    icon: <span data-testid="icon">🚀</span>,
  };

  it('should render title and description', () => {
    render(<FonctionalityItem {...defaultProps} />);
    
    expect(screen.getByText('Test Functionality')).toBeInTheDocument();
    expect(screen.getByText('This is a test functionality description')).toBeInTheDocument();
  });

  it('should render icon', () => {
    render(<FonctionalityItem {...defaultProps} />);
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    render(<FonctionalityItem {...defaultProps} />);
    
    const container = screen.getByText('Test Functionality').closest('.fonctionality-item');
    expect(container).toHaveClass('fonctionality-item');
  });

  it('should render with different props', () => {
    const newProps = {
      title: 'Another Functionality',
      description: 'Another description',
      icon: <span data-testid="new-icon">⭐</span>,
    };
    
    render(<FonctionalityItem {...newProps} />);
    
    expect(screen.getByText('Another Functionality')).toBeInTheDocument();
    expect(screen.getByText('Another description')).toBeInTheDocument();
    expect(screen.getByTestId('new-icon')).toBeInTheDocument();
  });
}); 