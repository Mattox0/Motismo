import { render } from '@testing-library/react';
import React from 'react';

import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders loading spinner with default className', () => {
    render(<LoadingSpinner />);

    const spinnerContainer = document.querySelector('.parent-loader');
    expect(spinnerContainer).toBeInTheDocument();
    expect(spinnerContainer).toHaveClass('parent-loader');
    expect(spinnerContainer).not.toHaveClass('custom-class');
  });

  it('renders loading spinner with custom className', () => {
    render(<LoadingSpinner className="custom-class" />);

    const spinnerContainer = document.querySelector('.parent-loader');
    expect(spinnerContainer).toBeInTheDocument();
    expect(spinnerContainer).toHaveClass('parent-loader', 'custom-class');
  });

  it('renders loader span element', () => {
    render(<LoadingSpinner />);

    const loaderSpan = document.querySelector('.loader');
    expect(loaderSpan).toBeInTheDocument();
  });

  it('renders with empty string className', () => {
    render(<LoadingSpinner className="" />);

    const spinnerContainer = document.querySelector('.parent-loader');
    expect(spinnerContainer).toBeInTheDocument();
    expect(spinnerContainer).toHaveClass('parent-loader');
  });

  it('renders with multiple custom classes', () => {
    render(<LoadingSpinner className="class1 class2 class3" />);

    const spinnerContainer = document.querySelector('.parent-loader');
    expect(spinnerContainer).toBeInTheDocument();
    expect(spinnerContainer).toHaveClass('parent-loader', 'class1', 'class2', 'class3');
  });
});
