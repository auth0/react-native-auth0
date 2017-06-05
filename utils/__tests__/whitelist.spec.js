import { apply } from '../whitelist'
import faker from 'faker';

describe('whitelist', () => {

  const rules = {
    state: {required: true, message: 'must have a state'},
    nonce: {required: false, message: 'must have a nonce'},
    clientId: {required: false, message: 'must have a clientId', toName: 'client_id'},
  };

  it('should keep expected value', () => {
    const value = { state: faker.random.uuid() };
    expect(apply(rules, value)).toMatchObject(value);
  });

  it('should fail if required key is not found', () => {
    const value = { state: faker.random.uuid() };
    expect(() => apply(rules, {})).toThrowErrorMatchingSnapshot();
  });

  it('should fail with default message', () => {
    const value = { state: faker.random.uuid() };
    expect(() => apply({state: {required: true}}, {})).toThrowErrorMatchingSnapshot();
  });

  it('should handle multiple parameters', () => {
    const value = {
      state: faker.random.uuid(),
      nonce: faker.random.uuid()
    };
    expect(apply(rules, value)).toMatchObject(value);
  });

  it('should ignore non declared keys', () => {
    const state = faker.random.uuid()
    const value = {
      state,
      connection: faker.random.uuid()
    };
    expect(apply(rules, value)).toMatchObject({state});
  });

  it('should use mapped name if available', () => {
    const state = faker.random.uuid()
    const clientId = faker.random.uuid()
    const value = {
      state,
      clientId
    };
    expect(apply(rules, value)).toMatchObject({
      state,
      'client_id': clientId
    });
  });
});