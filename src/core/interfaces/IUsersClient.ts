import type { User, GetUserParameters, PatchUserParameters } from '../../types';

/**
 * Defines the contract for a client that interacts with the Auth0 Management API's
 * user endpoints. An instance of this client is typically created with a
 * user-specific management token.
 *
 * @deprecated Will be removed in v6, along with `Auth0.users()`. Move Management API
 * operations to a backend you control (a BFF).
 */
export interface IUsersClient {
  /**
   * Retrieves the full profile of a user from the Management API.
   *
   * @param parameters The parameters containing the user's ID.
   * @returns A promise that resolves with the user's full profile.
   *
   * @deprecated Will be removed in v6. To read the current user's profile, use
   * `auth.userInfo()` or the `user` object from `useAuth0()` — neither needs the
   * Management API. For other users, call the Management API from a backend.
   */
  getUser(parameters: GetUserParameters): Promise<User>;

  /**
   * Updates a user's `user_metadata`.
   *
   * @param parameters The parameters containing the user's ID and the metadata to update.
   * @returns A promise that resolves with the updated user profile.
   *
   * @deprecated Will be removed in v6. Expose an endpoint on a backend you control
   * that performs the update after authorizing the request.
   */
  patchUser(parameters: PatchUserParameters): Promise<User>;
}
