import { render, screen } from '@testing-library/react';

import { StudentCard } from '../StudentCard';

const mockStudent = {
  id: '1',
  username: 'john.doe',
  email: 'john.doe@example.com',
  role: 'Student',
  creationDate: new Date(),
};

describe('StudentCard', () => {
  it('renders student information correctly', () => {
    render(<StudentCard student={mockStudent} />);

    expect(screen.getByText('john.doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('renders with correct CSS classes', () => {
    render(<StudentCard student={mockStudent} />);

    const card = screen.getByText('john.doe').closest('.student-card');
    expect(card).toBeInTheDocument();

    const info = screen.getByText('john.doe').closest('.student-info');
    expect(info).toBeInTheDocument();
  });
});
