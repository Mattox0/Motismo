/// <reference types="@testing-library/jest-dom" />

import { toast } from 'react-toastify';

import { showToast, defaultOptions } from '../toast';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

const mockToast = toast as jest.Mocked<typeof toast>;

describe('toast utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('defaultOptions', () => {
    it('should have correct default options', () => {
      expect(defaultOptions).toEqual({
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });
  });

  describe('showToast.success', () => {
    it('should call toast.success with message and default options', () => {
      showToast.success('Success message');
      expect(mockToast.success).toHaveBeenCalledWith('Success message', defaultOptions);
    });

    it('should merge custom options with default options', () => {
      const customOptions = { autoClose: 5000 };
      showToast.success('Success message', customOptions);
      expect(mockToast.success).toHaveBeenCalledWith('Success message', {
        ...defaultOptions,
        ...customOptions,
      });
    });
  });

  describe('showToast.error', () => {
    it('should call toast.error with message and default options', () => {
      showToast.error('Error message');
      expect(mockToast.error).toHaveBeenCalledWith('Error message', defaultOptions);
    });

    it('should merge custom options with default options', () => {
      const customOptions = { position: 'bottom-left' as const };
      showToast.error('Error message', customOptions);
      expect(mockToast.error).toHaveBeenCalledWith('Error message', {
        ...defaultOptions,
        ...customOptions,
      });
    });
  });

  describe('showToast.info', () => {
    it('should call toast.info with message and default options', () => {
      showToast.info('Info message');
      expect(mockToast.info).toHaveBeenCalledWith('Info message', defaultOptions);
    });
  });

  describe('showToast.warning', () => {
    it('should call toast.warning with message and default options', () => {
      showToast.warning('Warning message');
      expect(mockToast.warning).toHaveBeenCalledWith('Warning message', defaultOptions);
    });
  });
});
