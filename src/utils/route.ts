import type { ApiRoute, HttpMethod } from '../types/api-route.type';

/**
 * Helper function to create API route string
 * @param method - HTTP method
 * @param path - API path
 * @returns Formatted API route string
 *
 * @example
 * route('POST', 'api/v1/auth/register') // returns "@POST api/v1/auth/register"
 * route('GET', 'users') // returns "@GET users"
 * route('PUT', 'users/:id') // returns "@PUT users/:id"
 */
export const route = (method: HttpMethod, path: string): ApiRoute => `@${method} ${path}`;
