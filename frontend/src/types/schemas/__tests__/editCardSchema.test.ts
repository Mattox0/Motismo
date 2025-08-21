import { editCardSchema } from '../editCardSchema';

describe('editCardSchema', () => {
  it('validates valid card data', () => {
    const validData = {
      title: 'Test Card',
      classIds: ['1', '2'],
    };
    const result = editCardSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates minimum title length', () => {
    const invalidData = {
      title: 'AB',
      classIds: ['1'],
    };
    const result = editCardSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('edit_card.validation.title_min_length');
    }
  });

  it('validates maximum title length', () => {
    const longTitle = 'A'.repeat(51);
    const invalidData = {
      title: longTitle,
      classIds: ['1'],
    };
    const result = editCardSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('edit_card.validation.title_max_length');
    }
  });

  it('validates valid image file', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const validData = {
      title: 'Test Card',
      image: file,
      classIds: ['1'],
    };
    const result = editCardSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates image file size limit', () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const invalidData = {
      title: 'Test Card',
      image: largeFile,
      classIds: ['1'],
    };
    const result = editCardSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('edit_card.validation.image_size');
    }
  });

  it('validates image file type', () => {
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const invalidData = {
      title: 'Test Card',
      image: invalidFile,
      classIds: ['1'],
    };
    const result = editCardSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('edit_card.validation.image_type');
    }
  });

  it('validates PNG image file', () => {
    const pngFile = new File(['test'], 'test.png', { type: 'image/png' });
    const validData = {
      title: 'Test Card',
      image: pngFile,
      classIds: ['1'],
    };
    const result = editCardSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates GIF image file', () => {
    const gifFile = new File(['test'], 'test.gif', { type: 'image/gif' });
    const validData = {
      title: 'Test Card',
      image: gifFile,
      classIds: ['1'],
    };
    const result = editCardSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates without image', () => {
    const validData = {
      title: 'Test Card',
      classIds: ['1'],
    };
    const result = editCardSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates empty classIds array', () => {
    const validData = {
      title: 'Test Card',
      classIds: [],
    };
    const result = editCardSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates multiple classIds', () => {
    const validData = {
      title: 'Test Card',
      classIds: ['1', '2', '3'],
    };
    const result = editCardSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });
});
