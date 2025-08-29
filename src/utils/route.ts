import type { ApiRoute, HttpMethod } from '../types/api-route.type';

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
