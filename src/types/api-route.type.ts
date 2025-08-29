/* eslint-disable perfectionist/sort-modules */
/**
 * HTTP Methods for API routes
 */
export type HttpMethod = 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT';

/**
 * API Route format: @METHOD /path/to/endpoint
 * Example: @POST /api/v1/auth/register
 */
export type ApiRoute = `@${HttpMethod} /${string}`;

/**
 * Helper function to create API route string
 * @param method - HTTP method
 * @param path - API path (without leading slash)
 * @returns Formatted API route string
 *
 * @example
 * route('POST', 'api/v1/auth/register') // returns "@POST /api/v1/auth/register"
 */
export const route = (method: HttpMethod, path: string): ApiRoute => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    return `@${method} /${cleanPath}`;
};
