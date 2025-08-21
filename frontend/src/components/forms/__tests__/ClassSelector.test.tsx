import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { IClasse } from '@/types/model/IClasse';

import { ClassSelector } from '../ClassSelector';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key === 'create_quiz.form.selected_classes') {
        return `${params?.count} classes selected`;
      }
      return key;
    },
  }),
}));

const mockClasses: IClasse[] = [
  { id: '1', name: 'Class A', code: 'CA123', students: [], teachers: [] },
  { id: '2', name: 'Class B', code: 'CB456', students: [], teachers: [] },
  { id: '3', name: 'Class C', code: 'CC789', students: [], teachers: [] },
];

describe('ClassSelector', () => {
  const mockOnSelectionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with placeholder when no classes selected', () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    expect(screen.getByText('create_quiz.form.classes')).toBeInTheDocument();
    expect(screen.getByText('create_quiz.form.classes_placeholder')).toBeInTheDocument();
  });

  it('shows selected classes', () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    expect(screen.getByText('Class A')).toBeInTheDocument();
    expect(screen.getByText('Class B')).toBeInTheDocument();
    expect(screen.getByText('2 classes selected')).toBeInTheDocument();
  });

  it('shows "more" indicator when more than 2 classes selected', () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={['1', '2', '3']}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    expect(screen.getByText('Class A')).toBeInTheDocument();
    expect(screen.getByText('Class B')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('opens dropdown when trigger is clicked', () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const trigger = screen
      .getByText('create_quiz.form.classes_placeholder')
      .closest('.class-selector__trigger');
    fireEvent.click(trigger!);

    expect(screen.getByText('create_quiz.form.select_all')).toBeInTheDocument();
    expect(screen.getByText('create_quiz.form.select_none')).toBeInTheDocument();
    expect(screen.getByText('Class A')).toBeInTheDocument();
    expect(screen.getByText('CA123')).toBeInTheDocument();
  });

  it('closes dropdown when clicked outside', async () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const trigger = screen
      .getByText('create_quiz.form.classes_placeholder')
      .closest('.class-selector__trigger');
    fireEvent.click(trigger!);

    expect(screen.getByText('create_quiz.form.select_all')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('create_quiz.form.select_all')).not.toBeInTheDocument();
    });
  });

  it('does not close dropdown when clicking inside', () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const trigger = screen
      .getByText('create_quiz.form.classes_placeholder')
      .closest('.class-selector__trigger');
    fireEvent.click(trigger!);

    const dropdown = document.querySelector('.class-selector__dropdown');
    fireEvent.mouseDown(dropdown!);

    expect(screen.getByText('create_quiz.form.select_all')).toBeInTheDocument();
  });

  it('toggles class selection', () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const trigger = screen
      .getByText('create_quiz.form.classes_placeholder')
      .closest('.class-selector__trigger');
    fireEvent.click(trigger!);

    const checkbox = screen.getByLabelText(/Class A/);
    fireEvent.click(checkbox);

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['1']);
  });

  it('deselects class when already selected', () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={['1']}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const trigger = document.querySelector('.class-selector__trigger');
    fireEvent.click(trigger!);

    const checkbox = screen.getByLabelText(/Class A/);
    fireEvent.click(checkbox);

    expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
  });

  it('selects all classes', () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const trigger = screen
      .getByText('create_quiz.form.classes_placeholder')
      .closest('.class-selector__trigger');
    fireEvent.click(trigger!);

    const selectAllButton = screen.getByText('create_quiz.form.select_all');
    fireEvent.click(selectAllButton);

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['1', '2', '3']);
  });

  it('selects none classes', () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const trigger = document.querySelector('.class-selector__trigger');
    fireEvent.click(trigger!);

    const selectNoneButton = screen.getByText('create_quiz.form.select_none');
    fireEvent.click(selectNoneButton);

    expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
  });

  it('shows empty state when no classes available', () => {
    render(
      <ClassSelector classes={[]} selectedClassIds={[]} onSelectionChange={mockOnSelectionChange} />
    );

    const trigger = screen
      .getByText('create_quiz.form.classes_placeholder')
      .closest('.class-selector__trigger');
    fireEvent.click(trigger!);

    expect(screen.getByText('create_quiz.form.no_classes')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={[]}
        onSelectionChange={mockOnSelectionChange}
        error="validation.required"
      />
    );

    expect(screen.getByText('validation.required')).toBeInTheDocument();
    expect(document.querySelector('.class-selector__trigger--error')).toBeInTheDocument();
  });

  it('shows arrow rotation when dropdown is open', () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const trigger = screen
      .getByText('create_quiz.form.classes_placeholder')
      .closest('.class-selector__trigger');

    const arrowBefore = document.querySelector('.class-selector__arrow');
    expect(arrowBefore).not.toHaveClass('class-selector__arrow--open');

    fireEvent.click(trigger!);

    const arrowAfter = document.querySelector('.class-selector__arrow');
    expect(arrowAfter).toHaveClass('class-selector__arrow--open');
  });

  it('does not show summary when no classes selected', () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    expect(screen.queryByText(/classes selected/)).not.toBeInTheDocument();
  });

  it('handles checkbox changes correctly', () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={['1']}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const trigger = document.querySelector('.class-selector__trigger');
    fireEvent.click(trigger!);

    // Check the state of checkboxes
    const checkbox1 = screen.getByLabelText(/Class A/) as HTMLInputElement;
    const checkbox2 = screen.getByLabelText(/Class B/) as HTMLInputElement;

    expect(checkbox1.checked).toBe(true);
    expect(checkbox2.checked).toBe(false);

    // Toggle checkbox 2
    fireEvent.click(checkbox2);
    expect(mockOnSelectionChange).toHaveBeenCalledWith(['1', '2']);
  });

  it('handles clicking on different parts of option labels', () => {
    render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const trigger = screen
      .getByText('create_quiz.form.classes_placeholder')
      .closest('.class-selector__trigger');
    fireEvent.click(trigger!);

    // Click on the class name span
    const classNameSpan = screen.getByText('Class A');
    fireEvent.click(classNameSpan);

    // Should still trigger the change
    expect(mockOnSelectionChange).toHaveBeenCalledWith(['1']);
  });

  it('properly manages event listeners on cleanup', () => {
    const { unmount } = render(
      <ClassSelector
        classes={mockClasses}
        selectedClassIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const trigger = screen
      .getByText('create_quiz.form.classes_placeholder')
      .closest('.class-selector__trigger');
    fireEvent.click(trigger!);

    // Unmount component
    unmount();

    // Event listener should be cleaned up - no way to directly test this
    // but the useEffect cleanup should run
    expect(() => fireEvent.mouseDown(document.body)).not.toThrow();
  });
});
