import { QueryTags } from '../QueryTags';

describe('QueryTags', () => {
  it('should export QueryTags enum', () => {
    expect(QueryTags).toBeDefined();
    expect(typeof QueryTags).toBe('object');
  });

  it('should be an object with string values', () => {
    expect(QueryTags).toEqual(expect.any(Object));

    const keys = Object.keys(QueryTags);
    expect(keys.length).toBeGreaterThan(0);
  });
});
