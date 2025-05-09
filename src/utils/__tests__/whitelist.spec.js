import { apply } from '../whitelist';
import { deepEqual } from '../deepEqual';
import { faker } from '@faker-js/faker';

describe('whitelist', () => {
  const rules = {
    parameters: {
      state: { required: true },
      nonce: { required: false },
      clientId: { required: false, toName: 'client_id' },
      realm: {},
    },
    aliases: {
      connection: 'realm',
      clientID: 'clientId',
    },
  };

  it('should keep declared values', () => {
    const value = {
      state: faker.string.uuid(),
      nonce: faker.string.uuid(),
      clientId: faker.string.uuid(),
      connection: faker.string.alpha(),
    };
    expect(apply(rules, value)).toMatchObject({
      state: value.state,
      nonce: value.nonce,
      client_id: value.clientId,
      realm: value.connection,
    });
  });

  it('should fail if required key is not found', () => {
    const value = { state: faker.string.uuid() };
    expect(() => apply(rules, {})).toThrowErrorMatchingSnapshot();
  });

  it('should handle multiple parameters', () => {
    const value = {
      state: faker.string.uuid(),
      nonce: faker.string.uuid(),
    };
    expect(apply(rules, value)).toMatchObject(value);
  });

  it('should remove non declared keys by default', () => {
    const state = faker.string.uuid();
    const value = {
      state,
      initialState: faker.string.uuid(),
    };
    expect(apply(rules, value)).toMatchObject({ state });
  });

  it('should keep non declared keys', () => {
    const state = faker.string.uuid();
    const value = {
      state,
      initialState: faker.string.uuid(),
    };
    const allowNonDeclared = { whitelist: false, ...rules };
    expect(apply(allowNonDeclared, value)).toMatchObject(value);
  });

  it('should consider parameters as optional by default', () => {
    const value = {
      state: faker.string.uuid(),
    };
    expect(apply(rules, value)).toMatchObject({ state: value.state });
  });

  it('should use mapped name if available', () => {
    const state = faker.string.uuid();
    const clientId = faker.string.uuid();
    const value = {
      state,
      clientId,
    };
    expect(apply(rules, value)).toMatchObject({
      state,
      client_id: clientId,
    });
  });
});

describe('test deep equals', () => {
  test('returns true for equal objects', () => {
    const obj1 = {
      name: 'John',
      age: 30,
      address: { city: 'New York', state: 'NY' },
    };
    const obj2 = {
      name: 'John',
      age: 30,
      address: { city: 'New York', state: 'NY' },
    };
    expect(deepEqual(obj1, obj2)).toBe(true);
  });

  test('returns false for different objects', () => {
    const obj1 = {
      name: 'John',
      age: 30,
      address: { city: 'New York', state: 'NY' },
    };
    const obj2 = {
      name: 'Jane',
      age: 25,
      address: { city: 'Boston', state: 'MA' },
    };
    expect(deepEqual(obj1, obj2)).toBe(false);
  });

  test('returns false for objects with different nested properties', () => {
    const obj1 = {
      name: 'John',
      age: 30,
      address: { city: 'New York', state: 'NY' },
    };
    const obj2 = {
      name: 'John',
      age: 30,
      address: { city: 'Boston', state: 'MA' },
    };
    expect(deepEqual(obj1, obj2)).toBe(false);
  });

  test('returns false for objects with different numbers of properties', () => {
    const obj1 = { name: 'John', age: 30 };
    const obj2 = {
      name: 'John',
      age: 30,
      address: { city: 'New York', state: 'NY' },
    };
    expect(deepEqual(obj1, obj2)).toBe(false);
  });

  test('returns false for objects with null values', () => {
    const obj1 = { name: 'John', age: 30, address: null };
    const obj2 = {
      name: 'John',
      age: 30,
      address: { city: 'New York', state: 'NY' },
    };
    expect(deepEqual(obj1, obj2)).toBe(false);
  });
});
