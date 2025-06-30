import type { GetUserOptions, PatchUserOptions } from '../types';

class UsersApi {
  constructor(
    private domain: string,
    private token: string
  ) {}

  /**
   * Fetches user profile from the Management API.
   * WARNING: This should be used with caution on the client-side.
   * It is generally recommended to perform management tasks on a backend.
   */
  async getUser(parameters: GetUserOptions): Promise<User> {
    const { id, headers } = parameters;
    const response = await fetch(`https://${this.domain}/api/v2/users/${id}`, {
      headers: {
        ...headers,
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch user: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Patches a user's metadata using the Management API.
   * WARNING: This should be used with caution on the client-side.
   */
  async patchUser(parameters: PatchUserOptions): Promise<User> {
    const { id, metadata, headers } = parameters;
    const response = await fetch(`https://${this.domain}/api/v2/users/${id}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({ user_metadata: metadata }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to patch user: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }
}

export default UsersApi;
