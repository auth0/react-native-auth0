declare module "react-native-auth0" {
    /**
     * Auth
     */

    interface AuthorizationUrlParams {
        responseType: string;
        redirectUri: string;
        state: string;
    }

    interface CreateUserParams<T extends any> {
        email: string;
        username?: string;
        password: string;
        connection: string;
        metadata?: T;
    }

    interface CreateUserResponse {
        Id: string;
        emailVerified: boolean;
        email: string;
    }

    interface ExchangeParams {
        code: string;
        redirectUri: string;
        verifier: string;
    }

    interface LogoutParams {
        federated: boolean;
        clientId?: string;
        returnTo?: string;
    }

    interface PasswordRealmParams {
        username: string;
        password: string;
        realm: string;
        audience?: string;
        scope?: string;
    }

    interface PasswordRealmResponse {
        accessToken: string;
        expiresIn: number;
        idToken: string;
        scope: string;
        tokenType: "Bearer";
    }

    interface RefreshTokenParams {
        refreshToken: string;
        scope?: string;
    }

    interface RevokeParams {
        refreshToken: string;
    }

    interface UserInfoParams {
        token: string;
    }

    interface UserInfo {
        email: string;
        emailVerified: boolean;
        name: string;
        nickname: string;
        picture: string;
        sub: string;
        updatedAt: string;
    }

    export class Auth {
        public authorizationUrl(params: AuthorizationUrlParams): string;
        public createUser<T extends any>(
            user: CreateUserParams<T>
        ): Promise<CreateUserResponse>;
        public exchange(params: ExchangeParams): Promise<string>;
        public logoutUrl(params: LogoutParams): string;
        public passwordRealm(
            params: PasswordRealmParams
        ): Promise<PasswordRealmResponse>;

        public refreshToken(params: RefreshTokenParams): Promise<any>;
        public revoke(params: RevokeParams): Promise<any>;
        public userInfo(params: UserInfoParams): Promise<UserInfo>;
    }

    /**
     * Users
     */
    interface Auth0User<T> {
        created_at: string;
        email: string;
        emailVerified: boolean;
        identities: any[];
        last_ip?: string;
        last_login?: string;
        logins_count: number;
        name: string;
        nickname: string;
        picture?: string;
        updated_at: string;
        userId: string;
        userMetadata?: T;
    }

    interface GetUserParams {
        id: string;
    }

    interface PatchUserParams<T> {
        id: string;
        metadata: T;
    }

    export class Users {
        constructor(options: UsersOptions);
        public getUser<T extends any>(
            parameters: GetUserParams
        ): Promise<Auth0User<T>>;
        public patchUser<T extends any>(
            parameters: PatchUserParams<T>
        ): Promise<Auth0User<T>>;
    }

    /**
     * Web Auth
     */
    interface AuthorizeParams {
        state?: string;
        nonce?: string;
        audience?: string;
        scope?: string;
    }

    interface ClearSessionParams {
        federated: boolean;
    }

    export class WebAuth {
        public authorize(parameters: AuthorizeParams): Promise<any>;
        public clearSession(parameters: ClearSessionParams): Promise<any>;
    }

    interface UsersOptions {
        baseUrl: Options["domain"];
        token: string;
    }

    interface Options {
        domain: string;
        clientId: string;
    }

    /**
     * Auth0
     */

    export default class Auth0 {
        public auth: Auth;
        public webAuth: WebAuth;
        constructor(options: Options);

        public users(token: string): Users;
    }

    export const users: Users;
}
