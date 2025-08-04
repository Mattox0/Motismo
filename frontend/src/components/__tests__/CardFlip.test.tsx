import { render, screen, fireEvent } from '@testing-library/react';

import CardFlip from '../CardFlip';

describe('CardFlip', () => {
  const defaultProps = {
    frontContent: 'Front Text',
    backContent: 'Back Text',
    frontType: 'text' as const,
    backType: 'text' as const,
  };

  it('should render front content initially', () => {
    render(<CardFlip {...defaultProps} />);

    expect(screen.getByText('Front Text')).toBeInTheDocument();
    expect(screen.getByText('Terme :')).toBeInTheDocument();
  });

  it('should flip card when clicked', () => {
    render(<CardFlip {...defaultProps} />);

    const card = screen.getByText('Front Text').closest('.card-flip__inner');
    fireEvent.click(card!);

    expect(screen.getByText('Back Text')).toBeInTheDocument();
    expect(screen.getByText('Définition :')).toBeInTheDocument();
  });

  it('should render image when type is image', () => {
    render(
      <CardFlip
        {...defaultProps}
        frontType="image"
        backType="image"
        frontContent="test-image.jpg"
        backContent="test-back-image.jpg"
      />
    );

    const frontImage = screen.getByAltText('card front');
    expect(frontImage).toBeInTheDocument();
    expect(frontImage).toHaveAttribute('src', 'test-image.jpg');
  });

  it('should work as controlled component', () => {
    const setFlipped = jest.fn();
    render(<CardFlip {...defaultProps} flipped={false} setFlipped={setFlipped} />);

    const card = screen.getByText('Front Text').closest('.card-flip__inner');
    fireEvent.click(card!);

    expect(setFlipped).toHaveBeenCalledWith(true);
  });
});
