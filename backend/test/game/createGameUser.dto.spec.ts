import { validate } from 'class-validator';
import { CreateGameUserDto } from '@/game/dto/createGameUser.dto';

describe('CreateGameUserDto', () => {
  it('should be valid with all required fields', async () => {
    const dto = new CreateGameUserDto();
    dto.name = 'John Doe';
    dto.avatar = 'https://api.dicebear.com/avatar.png';
    dto.externalId = 'user-uuid-123';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should be valid without optional externalId', async () => {
    const dto = new CreateGameUserDto();
    dto.name = 'Jane Doe';
    dto.avatar = 'https://api.dicebear.com/avatar2.png';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation if name is empty', async () => {
    const dto = new CreateGameUserDto();
    dto.name = '';
    dto.avatar = 'https://api.dicebear.com/avatar.png';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation if name is missing', async () => {
    const dto = new CreateGameUserDto();
    dto.avatar = 'https://api.dicebear.com/avatar.png';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should fail validation if name is not a string', async () => {
    const dto = new CreateGameUserDto();
    (dto as any).name = 123;
    dto.avatar = 'https://api.dicebear.com/avatar.png';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation if avatar is empty', async () => {
    const dto = new CreateGameUserDto();
    dto.name = 'John Doe';
    dto.avatar = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('avatar');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation if avatar is missing', async () => {
    const dto = new CreateGameUserDto();
    dto.name = 'John Doe';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('avatar');
  });

  it('should fail validation if avatar is not a string', async () => {
    const dto = new CreateGameUserDto();
    dto.name = 'John Doe';
    (dto as any).avatar = 123;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('avatar');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation if externalId is provided but not a string', async () => {
    const dto = new CreateGameUserDto();
    dto.name = 'John Doe';
    dto.avatar = 'https://api.dicebear.com/avatar.png';
    (dto as any).externalId = 123;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('externalId');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should handle whitespace in name validation', async () => {
    const dto = new CreateGameUserDto();
    dto.name = '   ';
    dto.avatar = 'https://api.dicebear.com/avatar.png';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should handle whitespace in avatar validation', async () => {
    const dto = new CreateGameUserDto();
    dto.name = 'John Doe';
    dto.avatar = '   ';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});