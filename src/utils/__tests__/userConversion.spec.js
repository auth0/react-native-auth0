import {convertUser} from '../userConversion';

describe('user conversion', () => {
  test('conversion happens properly', () => {
    const user = {
      family_name: 'Family',
      name: 'Test',
      custom_claim: 'custom',
    };
    let finalUser = convertUser(user);
    expect(finalUser).toEqual({
      familyName: 'Family',
      name: 'Test',
      custom_claim: 'custom',
    });
  });
});
