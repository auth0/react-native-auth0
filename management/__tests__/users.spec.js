import Users from '../users';
import fetchMock from 'fetch-mock';

describe('users', () => {

  const baseUrl = 'samples.auth0.com';
  const telemetry = {name: 'react-native-auth0', version: '1.0.0'};
  const token = 'a.token.from.the.user'
  const unexpectedError = {
    status: 500,
    body: 'Internal Server Error....',
    headers: { 'Content-Type': 'text/plain' }
  };
  const auth0Error = {
    status: 403,
    body: {
      'error': 'Forbidden',
      'errorCode': 'unowned_resource',
      'message': 'User to be acted on does not match subject in bearer token.',
      'statusCode': 403
    },
    headers: { 'Content-Type': 'application/json' }
  };

  const users = new Users({baseUrl, telemetry, token});

  beforeEach(fetchMock.restore);

  describe('constructor', () => {
    it('should build with domain', () => {
      const users = new Users({baseUrl, token});
      expect(users.client.bearer).toContain(token);
    });

    it('should fail without token', () => {
      expect(() => new Users({baseUrl})).toThrowErrorMatchingSnapshot();
    });

    it('should fail without domain', () => {
      expect(() => new Users({token})).toThrowErrorMatchingSnapshot();
    });
  });

  const userId = 'auth0|53b995f8bce68d9fc900099c';

  describe('GET user', () => {
    it('should send correct payload', async () => {
      fetchMock.getOnce(`https://samples.auth0.com/api/v2/users/${encodeURIComponent(userId)}`, user);
      expect.assertions(1);
      await users.getUser({id: userId});
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should return successful response', async () => {
      fetchMock.getOnce(`https://samples.auth0.com/api/v2/users/${encodeURIComponent(userId)}`, user);
      expect.assertions(1);
      await expect(users.getUser({id: userId})).resolves.toMatchSnapshot();
    });

    it('should handle oauth error', async () => {
      fetchMock.getOnce(`https://samples.auth0.com/api/v2/users/${encodeURIComponent(userId)}`, auth0Error);
      expect.assertions(1);
      await expect(users.getUser({id: userId})).rejects.toMatchSnapshot();
    });

    it('should handle unexpected error', async () => {
      fetchMock.getOnce(`https://samples.auth0.com/api/v2/users/${encodeURIComponent(userId)}`, unexpectedError);
      expect.assertions(1);
      await expect(users.getUser({id: userId})).rejects.toMatchSnapshot();
    });
  });

  describe('PATCH user', () => {
    const metadata = { first_name: 'Mike', lastName: 'Doe' };
    it('should send correct payload', async () => {
      fetchMock.patchOnce(`https://samples.auth0.com/api/v2/users/${encodeURIComponent(userId)}`, user);
      expect.assertions(1);
      await users.patchUser({id: userId, metadata});
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should return successful response', async () => {
      fetchMock.patchOnce(`https://samples.auth0.com/api/v2/users/${encodeURIComponent(userId)}`, user);
      expect.assertions(1);
      await expect(users.patchUser({id: userId, metadata})).resolves.toMatchSnapshot();
    });

    it('should handle oauth error', async () => {
      fetchMock.patchOnce(`https://samples.auth0.com/api/v2/users/${encodeURIComponent(userId)}`, auth0Error);
      expect.assertions(1);
      await expect(users.patchUser({id: userId, metadata})).rejects.toMatchSnapshot();
    });

    it('should handle unexpected error', async () => {
      fetchMock.patchOnce(`https://samples.auth0.com/api/v2/users/${encodeURIComponent(userId)}`, unexpectedError);
      expect.assertions(1);
      await expect(users.patchUser({id: userId, metadata})).rejects.toMatchSnapshot();
    });
  });
});

const user = {
    'app_metadata': {
        'name': 'info@auth0.com',
        'nickname': 'info',
        'picture': 'https://secure.gravatar.com/avatar/cfacbe113a96fdfc85134534771d88b4?s=480&r=pg&d=https%3A%2F%2Fssl.gstatic.com%2Fs2%2Fprofiles%2Fimages%2Fsilhouette80.png',
        'username': 'info'
    },
    'blocked': false,
    'created_at': '2014-07-06T18:33:49.005Z',
    'email': 'info@auth0.com',
    'email_verified': false,
    'identities': [
        {
            'connection': 'Username-Password-Authentication',
            'isSocial': false,
            'provider': 'auth0',
            'user_id': '53b995f8bce68d9fc900099c'
        },
        {
            'connection': 'wordpress',
            'isSocial': true,
            'profileData': {
                'display_name': 'csauth0',
                'email': 'cs.auth0@gmail.com',
                'email_verified': false,
                'language': 'en',
                'meta': {
                    'links': {
                        'flags': 'https://public-api.wordpress.com/rest/v1/me/flags',
                        'help': 'https://public-api.wordpress.com/rest/v1/me/help',
                        'self': 'https://public-api.wordpress.com/rest/v1/me',
                        'site': 'https://public-api.wordpress.com/rest/v1/sites/76327566'
                    }
                },
                'nickname': 'csauth0',
                'picture': 'https://1.gravatar.com/avatar/1ef438e4fd0867a8b85ba255c2023ae3?s=96&d=identicon&r=G',
                'primary_blog': 76327566,
                'profile_URL': 'http://en.gravatar.com/csauth0',
                'site_count': 1,
                'token_scope': [
                    ''
                ],
                'token_site_id': 76327566,
                'verified': true,
                'visible_site_count': 1
            },
            'provider': 'wordpress',
            'user_id': 72894558
        },
        {
            'connection': 'facebook',
            'isSocial': true,
            'profileData': {
                'age_range': {
                    'min': 21
                },
                'context': {
                    'id': 'dXNlcl9jb250ZAA0ZD',
                    'mutual_likes': {
                        'data': [],
                        'summary': {
                            'total_count': 0
                        }
                    }
                },
                'devices': [
                    {
                        'os': 'Android'
                    }
                ],
                'email': 'cs.auth0@gmail.com',
                'email_verified': true,
                'family_name': 'Foobar',
                'gender': 'male',
                'given_name': 'John',
                'installed': true,
                'is_verified': false,
                'link': 'http://www.facebook.com/100050452676',
                'locale': 'en_US',
                'name': 'Foobar John',
                'name_format': '{first} {last}',
                'picture': 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xpf1/v/t1.0-1/c15.0.50.50/p50x50/10354686_10150004552801856_220367501106153455_n.jpg?oh=e0b37ad2914032931c273619126878aa&oe=56496A2F&__gda__=1447695355_10ff74ec6ef8e26e46c4751a34c49bd0',
                'third_party_id': 'tQc5Y4aHE7Lu7fBQo5IB5OI2G6s',
                'timezone': -3,
                'updated_time': '2014-09-23T18:26:31+0000',
                'verified': true
            },
            'provider': 'facebook',
            'user_id': '100007950452676'
        }
    ],
    'last_ip': '181.47.186.202',
    'last_login': '2017-06-13T02:47:41.914Z',
    'logins_count': 1151,
    'multifactor': [
        'google-authenticator'
    ],
    'name': 'info@auth0.com',
    'nickname': 'info',
    'persistent': {},
    'picture': 'https://s.gravatar.com/avatar/cfacbe113a96fdfc85134534771d88b4?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fp.png',
    'updated_at': '2017-06-13T02:47:41.914Z',
    'user_id': 'auth0|53b995f8bce68d9fc900099c',
    'user_metadata': {
        'first_name': 'Info',
        'from': 'react-native',
        'last_name': 'Auth0'
    },
    'username': 'info'
};
