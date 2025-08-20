export const AUTH_TYPE = {
    API_KEY: 'apiKey',
    BASIC: 'basic',
    COOKIE: 'cookie',
    JWT: 'jwt',
    OAUTH2: 'oauth2',
} as const;

export type AuthType = (typeof AUTH_TYPE)[keyof typeof AUTH_TYPE];
