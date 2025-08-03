/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';

import { Title } from '../Title';

describe('Title component', () => {
  it('should render h1 element with correct variant', () => {
    render(<Title variant="h1">Main Title</Title>);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Main Title');
    expect(heading.tagName).toBe('H1');
  });

  it('should render h2 element with correct variant', () => {
    render(<Title variant="h2">Subtitle</Title>);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Subtitle');
    expect(heading.tagName).toBe('H2');
  });

  it('should render h3 element with correct variant', () => {
    render(<Title variant="h3">Section Title</Title>);

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Section Title');
    expect(heading.tagName).toBe('H3');
  });

  it('should render h4 element with correct variant', () => {
    render(<Title variant="h4">Subsection Title</Title>);

    const heading = screen.getByRole('heading', { level: 4 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Subsection Title');
    expect(heading.tagName).toBe('H4');
  });

  it('should apply default CSS classes', () => {
    render(<Title variant="h2">Test Title</Title>);

    const heading = screen.getByText('Test Title');
    expect(heading).toHaveClass('title', 'title-h2');
  });

  it('should apply additional className', () => {
    render(
      <Title variant="h3" className="custom-class">
        Test Title
      </Title>
    );

    const heading = screen.getByText('Test Title');
    expect(heading).toHaveClass('title', 'title-h3', 'custom-class');
  });

  it('should render with React elements as children', () => {
    render(
      <Title variant="h1">
        <span>Span content</span> and text
      </Title>
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toContainHTML('<span>Span content</span> and text');
  });

  it('should handle empty className correctly', () => {
    render(
      <Title variant="h1" className="">
        Title
      </Title>
    );

    const heading = screen.getByText('Title');
    expect(heading).toHaveClass('title', 'title-h1');
    expect(heading.className).toBe('title title-h1');
  });

  it('should filter out falsy values from className array', () => {
    render(
      <Title variant="h2" className={undefined}>
        Title
      </Title>
    );

    const heading = screen.getByText('Title');
    expect(heading).toHaveClass('title', 'title-h2');
    expect(heading.className).toBe('title title-h2');
  });
});
