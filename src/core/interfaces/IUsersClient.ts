import type { User, GetUserParameters, PatchUserParameters } from '../../types';

/**
 * Defines the contract for a client that interacts with the Auth0 Management API's
 * user endpoints. An instance of this client is typically created with a
 * user-specific management token.
 */
export interface IUsersClient {
  /**
   * Retrieves the full profile of a user from the Management API.
   *
   * @param parameters The parameters containing the user's ID.
   * @returns A promise that resolves with the user's full profile.
   */
  getUser(parameters: GetUserParameters): Promise<User>;

  /**
   * Updates a user's `user_metadata`.
   *
   * @param parameters The parameters containing the user's ID and the metadata to update.
   * @returns A promise that resolves with the updated user profile.
   */
  patchUser(parameters: PatchUserParameters): Promise<User>;
}
