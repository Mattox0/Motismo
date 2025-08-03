import { render, screen } from '@testing-library/react';

import AuthLayout from '../AuthLayout';

describe('AuthLayout', () => {
  it('should render children inside auth layout structure', () => {
    render(
      <AuthLayout>
        <div data-testid="test-child">Test Content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    );

    const authPage = document.querySelector('.auth-page');
    const authContainer = document.querySelector('.auth-container');

    expect(authPage).toBeInTheDocument();
    expect(authContainer).toBeInTheDocument();
  });

  it('should render multiple children correctly', () => {
    render(
      <AuthLayout>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
        <div data-testid="child3">Child 3</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
    expect(screen.getByTestId('child3')).toBeInTheDocument();
  });

  it('should render complex nested components', () => {
    const ComplexComponent = () => (
      <div>
        <h1>Title</h1>
        <p>Description</p>
        <button>Click me</button>
      </div>
    );

    render(
      <AuthLayout>
        <ComplexComponent />
      </AuthLayout>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
}); 