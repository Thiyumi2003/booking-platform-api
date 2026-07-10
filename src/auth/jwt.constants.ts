export const jwtConstants = {
  secret: process.env.JWT_SECRET ?? 'your-super-secret-key',
  expiresIn: '1h',
};
