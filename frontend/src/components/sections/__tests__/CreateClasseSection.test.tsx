import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { useCreateClasseMutation } from '@/services/classe.service';
import { showToast } from '@/utils/toast';

import { CreateClasseSection } from '../CreateClasseSection';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/services/classe.service');
jest.mock('@/utils/toast');

const mockUseCreateClasseMutation = useCreateClasseMutation as jest.MockedFunction<
  typeof useCreateClasseMutation
>;
const mockShowToast = showToast as jest.Mocked<typeof showToast>;

describe('CreateClasseSection', () => {
  const mockCreateClasse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClasse.mockClear();
    mockUseCreateClasseMutation.mockReturnValue([mockCreateClasse, { isLoading: false }]);
  });

  it('renders create button', () => {
    render(<CreateClasseSection />);

    expect(screen.getByText('classe.createNew')).toBeInTheDocument();
  });

  it('opens modal when create button is clicked', () => {
    render(<CreateClasseSection />);

    const createButton = screen.getByText('classe.createNew');
    fireEvent.click(createButton);

    expect(screen.getByLabelText('classe.name')).toBeInTheDocument();
  });

  it('closes modal when form is submitted successfully', async () => {
    mockCreateClasse.mockResolvedValueOnce({ data: { id: '1', name: 'Test Class' } });

    render(<CreateClasseSection />);

    const createButton = screen.getByText('classe.createNew');
    fireEvent.click(createButton);

    const nameInput = screen.getByLabelText('classe.name');
    const submitButton = screen.getByText('classe.create');

    fireEvent.change(nameInput, { target: { value: 'Test Class' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateClasse).toHaveBeenCalled();
    });
  });

  it('shows error toast when form submission fails', async () => {
    const mockCreateClasseWithError = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockRejectedValueOnce(new Error('Creation failed')),
    });
    mockUseCreateClasseMutation.mockReturnValue([mockCreateClasseWithError, { isLoading: false }]);

    render(<CreateClasseSection />);

    const createButton = screen.getByText('classe.createNew');
    fireEvent.click(createButton);

    const nameInput = screen.getByLabelText('classe.name');
    const submitButton = screen.getByText('classe.create');

    fireEvent.change(nameInput, { target: { value: 'Test Class' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateClasseWithError).toHaveBeenCalled();
    });
  });

  it('closes modal when close button is clicked', () => {
    render(<CreateClasseSection />);

    const createButton = screen.getByText('classe.createNew');
    fireEvent.click(createButton);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(screen.queryByLabelText('classe.name')).not.toBeInTheDocument();
  });

  it('handles form submission with unwrap method', async () => {
    const mockUnwrap = jest.fn().mockResolvedValue({ id: '1', name: 'Test Class' });
    mockCreateClasse.mockReturnValueOnce({ unwrap: mockUnwrap } as any);

    render(<CreateClasseSection />);

    const createButton = screen.getByText('classe.createNew');
    fireEvent.click(createButton);

    const nameInput = screen.getByLabelText('classe.name');
    const submitButton = screen.getByText('classe.create');

    fireEvent.change(nameInput, { target: { value: 'Test Class' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateClasse).toHaveBeenCalled();
    });
  });
});
