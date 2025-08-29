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
