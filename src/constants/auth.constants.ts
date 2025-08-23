/**
 * Authentication type constants for API security schemes.
 * @example
 * const authType = AUTH_TYPE.JWT; // 'jwt'
 */
export const AUTH_TYPE = {
    API_KEY: 'apiKey',
    BASIC: 'basic',
    COOKIE: 'cookie',
    JWT: 'jwt',
    OAUTH2: 'oauth2',
} as const;

/**
 * Union type representing all supported authentication types.
 * @example
 * const handleAuth = (type: AuthType) => {
 *   switch(type) {
 *     case AUTH_TYPE.JWT: return 'JWT Auth';
 *     case AUTH_TYPE.API_KEY: return 'API Key Auth';
 *   }
 * };
 */
export type AuthType = (typeof AUTH_TYPE)[keyof typeof AUTH_TYPE];
