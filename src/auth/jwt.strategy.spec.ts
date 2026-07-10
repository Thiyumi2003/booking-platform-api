import { extractJwtTokenFromHeader } from './jwt.strategy';

describe('extractJwtTokenFromHeader', () => {
  it('returns the token when the header uses Bearer prefix', () => {
    expect(extractJwtTokenFromHeader('Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  it('returns the token when the header contains repeated Bearer prefixes', () => {
    expect(extractJwtTokenFromHeader('Bearer Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  it('returns null for missing or empty values', () => {
    expect(extractJwtTokenFromHeader(undefined)).toBeNull();
    expect(extractJwtTokenFromHeader('')).toBeNull();
  });
});
