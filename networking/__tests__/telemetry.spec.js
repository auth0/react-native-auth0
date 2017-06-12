import defaults from '../telemetry';

describe('telemetry', () => {

  it('should have name', () => {
    expect(defaults.name).toEqual('react-native-auth0');
  });

  it('should have a version', () => {
    expect(defaults.version).toBeDefined();
  });
});