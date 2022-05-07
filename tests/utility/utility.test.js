import { validateEmail } from '../../src/utility';

describe('Utility', () => {
  it('validateEmail', () => {
    const email = 'test@example.com';
    expect(validateEmail(email)).toBeTruthy();

    const emailWithPlusCharacter = 'test+example.123@gmail.com';
    expect(validateEmail(emailWithPlusCharacter)).toBeTruthy();

    const notEmail = 'test';
    expect(validateEmail(notEmail)).toBeFalsy();
  });
});
