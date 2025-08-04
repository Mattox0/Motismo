import { render, screen } from '@testing-library/react';

import { GlobalLayout } from '../GlobalLayout';

jest.mock('@/components/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

describe('GlobalLayout', () => {
  it('should render children inside global layout', () => {
    render(
      <GlobalLayout>
        <div data-testid="test-child">Test Content</div>
      </GlobalLayout>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render navbar component', () => {
    render(
      <GlobalLayout>
        <div>Test Content</div>
      </GlobalLayout>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('should have correct CSS classes when screened is false', () => {
    render(
      <GlobalLayout>
        <div>Test Content</div>
      </GlobalLayout>
    );

    const main = document.querySelector('.global-layout');
    expect(main).toBeInTheDocument();
    expect(main).not.toHaveClass('screened');
  });

  it('should have screened class when screened is true', () => {
    render(
      <GlobalLayout screened={true}>
        <div>Test Content</div>
      </GlobalLayout>
    );

    const main = document.querySelector('.global-layout');
    expect(main).toHaveClass('screened');
  });

  it('should render multiple children correctly', () => {
    render(
      <GlobalLayout>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </GlobalLayout>
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
  });
});
