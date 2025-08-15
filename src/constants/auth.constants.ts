export const AUTH_TYPE = {
    JWT: 'jwt',
    API_KEY: 'apiKey',
    OAUTH2: 'oauth2',
    BASIC: 'basic',
    COOKIE: 'cookie',
} as const;

export type AuthType = (typeof AUTH_TYPE)[keyof typeof AUTH_TYPE];
