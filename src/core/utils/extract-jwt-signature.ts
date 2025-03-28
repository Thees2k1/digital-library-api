export const extractJWTSignature = (token: string) => {
  return token.split('.').pop() || '';
};
