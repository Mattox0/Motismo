import { render, screen } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  const defaultProps = {
    avatar: 'test-avatar.jpg',
    name: 'Test User',
    mode: 'lobby' as const,
  };

  it('should render avatar image', () => {
    render(<Avatar {...defaultProps} />);
    
    const image = screen.getByAltText('Test User');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'test-avatar.jpg');
  });

  it('should render name when mode is lobby', () => {
    render(<Avatar {...defaultProps} mode="lobby" />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should not render name when mode is not lobby', () => {
    render(<Avatar {...defaultProps} mode="other" />);
    
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('should use default avatar when no avatar provided', () => {
    render(<Avatar {...defaultProps} avatar="" />);
    
    const image = screen.getByAltText('Test User');
    expect(image).toHaveAttribute('src', '/default-avatar.png');
  });

  it('should have current class when mode is current', () => {
    render(<Avatar {...defaultProps} mode="current" />);
    
    const container = screen.getByAltText('Test User').closest('.lobby-participant');
    expect(container).toHaveClass('lobby-participant--current');
  });

  it('should not have current class when mode is not current', () => {
    render(<Avatar {...defaultProps} mode="other" />);
    
    const container = screen.getByAltText('Test User').closest('.lobby-participant');
    expect(container).not.toHaveClass('lobby-participant--current');
  });
}); 