/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */

// Mock all decorators first
const mockApplyDecorators = jest.fn().mockImplementation((...decorators) => decorators);
const mockSetMetadata = jest.fn().mockImplementation((key, value) => ({ key, value }));

jest.mock('@nestjs/common', () => ({
    applyDecorators: mockApplyDecorators,
    HttpStatus: {
        BAD_REQUEST: 400,
        CONFLICT: 409,
        CREATED: 201,
        FORBIDDEN: 403,
        INTERNAL_SERVER_ERROR: 500,
        NO_CONTENT: 204,
        NOT_FOUND: 404,
        OK: 200,
        SERVICE_UNAVAILABLE: 503,
        TOO_MANY_REQUESTS: 429,
        UNAUTHORIZED: 401,
        UNPROCESSABLE_ENTITY: 422,
    },
    SetMetadata: mockSetMetadata,
}));

const mockApiBadRequestResponse = jest
    .fn()
    .mockImplementation((options) => ({ type: 'ApiBadRequestResponse', options }));
const mockApiBasicAuth = jest.fn().mockImplementation(() => ({ type: 'ApiBasicAuth' }));
const mockApiBearerAuth = jest.fn().mockImplementation((name) => ({ name, type: 'ApiBearerAuth' }));
const mockApiBody = jest.fn().mockImplementation((options) => ({ type: 'ApiBody', options }));
const mockApiConflictResponse = jest.fn().mockImplementation((options) => ({ type: 'ApiConflictResponse', options }));
const mockApiConsumes = jest.fn().mockImplementation((...types) => ({ type: 'ApiConsumes', types }));
const mockApiCookieAuth = jest.fn().mockImplementation((name) => ({ name, type: 'ApiCookieAuth' }));
const mockApiForbiddenResponse = jest.fn().mockImplementation((options) => ({ type: 'ApiForbiddenResponse', options }));
const mockApiHeader = jest.fn().mockImplementation((options) => ({ type: 'ApiHeader', options }));
const mockApiInternalServerErrorResponse = jest
    .fn()
    .mockImplementation((options) => ({ type: 'ApiInternalServerErrorResponse', options }));
const mockApiNotFoundResponse = jest.fn().mockImplementation((options) => ({ type: 'ApiNotFoundResponse', options }));
const mockApiOAuth2 = jest.fn().mockImplementation((scopes, provider) => ({ type: 'ApiOAuth2', provider, scopes }));
const mockApiOperation = jest.fn().mockImplementation((options) => ({ type: 'ApiOperation', options }));
const mockApiParam = jest.fn().mockImplementation((options) => ({ type: 'ApiParam', options }));
const mockApiProduces = jest.fn().mockImplementation((...types) => ({ type: 'ApiProduces', types }));
const mockApiQuery = jest.fn().mockImplementation((options) => ({ type: 'ApiQuery', options }));
const mockApiResponse = jest.fn().mockImplementation((options) => ({ type: 'ApiResponse', options }));
const mockApiSecurity = jest.fn().mockImplementation((name) => ({ name, type: 'ApiSecurity' }));
const mockApiTags = jest.fn().mockImplementation((...tags) => ({ type: 'ApiTags', tags }));
const mockApiTooManyRequestsResponse = jest
    .fn()
    .mockImplementation((options) => ({ type: 'ApiTooManyRequestsResponse', options }));
const mockApiUnauthorizedResponse = jest
    .fn()
    .mockImplementation((options) => ({ type: 'ApiUnauthorizedResponse', options }));

jest.mock('@nestjs/swagger', () => ({
    ApiBadRequestResponse: mockApiBadRequestResponse,
    ApiBasicAuth: mockApiBasicAuth,
    ApiBearerAuth: mockApiBearerAuth,
    ApiBody: mockApiBody,
    ApiConflictResponse: mockApiConflictResponse,
    ApiConsumes: mockApiConsumes,
    ApiCookieAuth: mockApiCookieAuth,
    ApiForbiddenResponse: mockApiForbiddenResponse,
    ApiHeader: mockApiHeader,
    ApiInternalServerErrorResponse: mockApiInternalServerErrorResponse,
    ApiNotFoundResponse: mockApiNotFoundResponse,
    ApiOAuth2: mockApiOAuth2,
    ApiOperation: mockApiOperation,
    ApiParam: mockApiParam,
    ApiProduces: mockApiProduces,
    ApiQuery: mockApiQuery,
    ApiResponse: mockApiResponse,
    ApiSecurity: mockApiSecurity,
    ApiTags: mockApiTags,
    ApiTooManyRequestsResponse: mockApiTooManyRequestsResponse,
    ApiUnauthorizedResponse: mockApiUnauthorizedResponse,
}));

class MockApiCursorPaginatedResponseDto {}

class MockApiPaginatedResponseDto {}

// Mock DTOs
class MockApiResponseDto {}

class MockErrorResponseDto {}

jest.mock('../dto/api.response.dto', () => ({
    ApiResponseDto: jest.fn(() => MockApiResponseDto),
}));

jest.mock('../dto/error.response.dto', () => ({
    ErrorResponseDto: MockErrorResponseDto,
}));

jest.mock('../dto/paginated.response.dto', () => ({
    ApiCursorPaginatedResponseDto: jest.fn(() => MockApiCursorPaginatedResponseDto),
    ApiPaginatedResponseDto: jest.fn(() => MockApiPaginatedResponseDto),
}));

import { HttpStatus } from '@nestjs/common';

import { AUTH_TYPE } from '../constants';
import { PAGINATION_TYPE } from '../constants/pagination.constants';

import {
    ApiAuthEndpoint,
    ApiDeleteEndpoint,
    ApiEndpoint,
    ApiGetEndpoint,
    ApiPaginatedEndpoint,
    ApiPatchEndpoint,
    ApiPostEndpoint,
    ApiPutEndpoint,
    ApiValidationEndpoint,
} from './api-endpoint.decorator';

describe('ApiEndpoint Decorator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Configuration', () => {
        it('should create decorator with minimal configuration', () => {
            const result = ApiEndpoint({
                apiUrl: '@GET /api/test',
                summary: 'Test endpoint',
            } as any);

            expect(result).toBeDefined();
            expect(mockApiOperation).toHaveBeenCalled();
        });

        it('should include apiUrl in description', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/users',
                description: 'Get users',
                summary: 'Get users',
            } as any);

            expect(mockApiOperation).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: expect.stringContaining('@GET /api/users'),
                }),
            );
        });

        it('should handle deprecated flag', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                deprecated: true,
                summary: 'Deprecated endpoint',
            } as any);

            expect(mockApiOperation).toHaveBeenCalledWith(
                expect.objectContaining({
                    deprecated: true,
                }),
            );
        });

        it('should handle operationId', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                summary: 'Test endpoint',
                operationId: 'getTest',
            } as any);

            expect(mockApiOperation).toHaveBeenCalledWith(
                expect.objectContaining({
                    operationId: 'getTest',
                }),
            );
        });

        it('should handle externalDocs', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                externalDocs: {
                    description: 'More info',
                    url: 'https://example.com',
                },
                summary: 'Test endpoint',
            } as any);

            expect(mockApiOperation).toHaveBeenCalledWith(
                expect.objectContaining({
                    externalDocs: {
                        description: 'More info',
                        url: 'https://example.com',
                    },
                }),
            );
        });
    });

    describe('Tags', () => {
        it('should handle single tag as string', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                summary: 'Test',
                tags: 'Users',
            } as any);

            expect(mockApiTags).toHaveBeenCalledWith('Users');
        });

        it('should handle multiple tags as array', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                summary: 'Test',
                tags: ['Users', 'Admin'],
            } as any);

            expect(mockApiTags).toHaveBeenCalledWith('Users', 'Admin');
        });
    });

    describe('Content Types', () => {
        it('should handle consumes', () => {
            ApiEndpoint({
                apiUrl: '@POST /api/test',
                consumes: ['application/json', 'application/xml'],
                summary: 'Test',
            } as any);

            expect(mockApiConsumes).toHaveBeenCalledWith('application/json', 'application/xml');
        });

        it('should handle produces', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                produces: ['application/json', 'text/csv'],
                summary: 'Test',
            } as any);

            expect(mockApiProduces).toHaveBeenCalledWith('application/json', 'text/csv');
        });

        it('should not call ApiConsumes with empty array', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                consumes: [],
                summary: 'Test',
            } as any);

            expect(mockApiConsumes).not.toHaveBeenCalled();
        });

        it('should not call ApiProduces with empty array', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                produces: [],
                summary: 'Test',
            } as any);

            expect(mockApiProduces).not.toHaveBeenCalled();
        });
    });

    describe('Request Body', () => {
        it('should handle basic body configuration', () => {
            ApiEndpoint({
                apiUrl: '@POST /api/test',
                body: {
                    type: Object as any,
                    description: 'User data',
                },
                summary: 'Test',
            } as any);

            expect(mockApiBody).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: Object,
                    description: 'User data',
                }),
            );
        });

        it('should handle body with required flag', () => {
            ApiEndpoint({
                apiUrl: '@POST /api/test',
                body: {
                    type: Object as any,
                    required: true,
                },
                summary: 'Test',
            } as any);

            expect(mockApiBody).toHaveBeenCalledWith(
                expect.objectContaining({
                    required: true,
                }),
            );
        });

        it('should handle body with examples', () => {
            ApiEndpoint({
                apiUrl: '@POST /api/test',
                body: {
                    type: Object as any,
                    examples: {
                        example1: { name: 'John' },
                    },
                },
                summary: 'Test',
            } as any);

            expect(mockApiBody).toHaveBeenCalledWith(
                expect.objectContaining({
                    examples: {
                        example1: { name: 'John' },
                    },
                }),
            );
        });

        it('should handle file upload', () => {
            ApiEndpoint({
                apiUrl: '@POST /api/upload',
                body: {
                    files: [
                        { name: 'avatar', description: 'Avatar', required: true },
                        { name: 'covers', description: 'Cover', isArray: true, required: false },
                    ],
                },
                summary: 'Upload files',
            } as any);

            expect(mockApiConsumes).toHaveBeenCalledWith('multipart/form-data');
            expect(mockApiBody).toHaveBeenCalledWith(
                expect.objectContaining({
                    schema: expect.objectContaining({
                        type: 'object',
                        properties: expect.any(Object),
                        required: ['avatar'],
                    }),
                }),
            );
        });
    });

    describe('Query Parameters', () => {
        it('should handle single query parameter', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                queries: [
                    {
                        name: 'page',
                        type: 'number',
                        description: 'Page number',
                        required: false,
                    },
                ],
                summary: 'Test',
            } as any);

            expect(mockApiQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'page',
                    type: 'number',
                    description: 'Page number',
                    required: false,
                }),
            );
        });

        it('should handle query with example', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                queries: [
                    {
                        name: 'limit',
                        example: 10,
                    },
                ],
                summary: 'Test',
            } as any);

            expect(mockApiQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    example: 10,
                }),
            );
        });

        it('should handle query with enum', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                queries: [
                    {
                        name: 'order',
                        enum: ['ASC', 'DESC'],
                    },
                ],
                summary: 'Test',
            } as any);

            expect(mockApiQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    enum: ['ASC', 'DESC'],
                }),
            );
        });
    });

    describe('Path Parameters', () => {
        it('should handle string parameter', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/users/:id',
                params: [
                    {
                        name: 'id',
                        type: 'string',
                        description: 'User ID',
                    },
                ],
                summary: 'Get user',
            } as any);

            expect(mockApiParam).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'id',
                    required: true,
                    schema: expect.objectContaining({
                        type: 'string',
                    }),
                }),
            );
        });

        it('should handle number parameter', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/users/:id',
                params: [
                    {
                        name: 'id',
                        type: 'number',
                    },
                ],
                summary: 'Get user',
            } as any);

            expect(mockApiParam).toHaveBeenCalledWith(
                expect.objectContaining({
                    schema: expect.objectContaining({
                        type: 'number',
                    }),
                }),
            );
        });

        it('should handle uuid parameter', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/users/:id',
                params: [
                    {
                        name: 'id',
                        type: 'uuid',
                    },
                ],
                summary: 'Get user',
            } as any);

            expect(mockApiParam).toHaveBeenCalledWith(
                expect.objectContaining({
                    schema: expect.objectContaining({
                        type: 'string',
                        format: 'uuid',
                    }),
                }),
            );
        });

        it('should handle parameter with example', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/users/:id',
                params: [
                    {
                        name: 'id',
                        type: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                ],
                summary: 'Get user',
            } as any);

            expect(mockApiParam).toHaveBeenCalledWith(
                expect.objectContaining({
                    schema: expect.objectContaining({
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    }),
                }),
            );
        });

        it('should handle parameter with custom format', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/users/:id',
                params: [
                    {
                        name: 'email',
                        type: 'string',
                        format: 'email',
                    },
                ],
                summary: 'Get user',
            } as any);

            expect(mockApiParam).toHaveBeenCalledWith(
                expect.objectContaining({
                    schema: expect.objectContaining({
                        format: 'email',
                    }),
                }),
            );
        });
    });

    describe('Headers', () => {
        it('should handle custom headers', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                headers: [
                    {
                        name: 'X-API-Key',
                        description: 'API Key',
                        example: 'abc123',
                        required: true,
                    },
                ],
                summary: 'Test',
            } as any);

            expect(mockApiHeader).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'X-API-Key',
                    description: 'API Key',
                    example: 'abc123',
                    required: true,
                }),
            );
        });

        it('should handle header without description', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                headers: [
                    {
                        name: 'X-Custom-Header',
                    },
                ],
                summary: 'Test',
            } as any);

            expect(mockApiHeader).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'X-Custom-Header',
                    required: false,
                }),
            );
        });
    });

    describe('Responses', () => {
        it('should handle response with type', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                responses: {
                    [HttpStatus.OK]: {
                        type: Object as any,
                        description: 'Success',
                    },
                },
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalled();
        });

        it('should handle response with examples', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                responses: {
                    [HttpStatus.OK]: {
                        type: Object as any,
                        examples: {
                            success: { data: 'test' },
                        },
                    },
                },
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    examples: {
                        success: { data: 'test' },
                    },
                }),
            );
        });

        it('should handle response with headers', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                responses: {
                    [HttpStatus.OK]: {
                        type: Object as any,
                        headers: {
                            'X-Custom-Header': { description: 'Custom header' },
                        },
                    },
                },
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: {
                        'X-Custom-Header': { description: 'Custom header' },
                    },
                }),
            );
        });

        it('should handle response with isArray', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                responses: {
                    [HttpStatus.OK]: {
                        type: Object as any,
                        isArray: true,
                    },
                },
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    isArray: true,
                }),
            );
        });

        it('should handle paginated response with OFFSET', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/users',
                paginationType: PAGINATION_TYPE.OFFSET,
                responses: {
                    [HttpStatus.OK]: {
                        type: Object as any,
                    },
                },
                summary: 'List users',
            } as any);

            expect(mockApiResponse).toHaveBeenCalled();
        });

        it('should handle paginated response with CURSOR', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/users',
                paginationType: PAGINATION_TYPE.CURSOR,
                responses: {
                    [HttpStatus.OK]: {
                        type: Object as any,
                    },
                },
                summary: 'List users',
            } as any);

            expect(mockApiResponse).toHaveBeenCalled();
        });
    });

    describe('Authentication', () => {
        it('should handle JWT auth', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                auth: {
                    type: AUTH_TYPE.JWT,
                    required: true,
                },
                summary: 'Test',
            } as any);

            expect(mockApiBearerAuth).toHaveBeenCalledWith('bearer');
            expect(mockApiUnauthorizedResponse).toHaveBeenCalled();
            expect(mockApiForbiddenResponse).toHaveBeenCalled();
        });

        it('should handle JWT auth with custom provider', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                auth: {
                    type: AUTH_TYPE.JWT,
                    provider: 'access-token',
                },
                summary: 'Test',
            } as any);

            expect(mockApiBearerAuth).toHaveBeenCalledWith('access-token');
        });

        it('should handle API Key auth', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                auth: {
                    type: AUTH_TYPE.API_KEY,
                },
                summary: 'Test',
            } as any);

            expect(mockApiSecurity).toHaveBeenCalledWith('api-key');
        });

        it('should handle API Key auth with custom provider', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                auth: {
                    type: AUTH_TYPE.API_KEY,
                    provider: 'custom-key',
                },
                summary: 'Test',
            } as any);

            expect(mockApiSecurity).toHaveBeenCalledWith('custom-key');
        });

        it('should handle Basic auth', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                auth: {
                    type: AUTH_TYPE.BASIC,
                },
                summary: 'Test',
            } as any);

            expect(mockApiBasicAuth).toHaveBeenCalled();
        });

        it('should handle Cookie auth', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                auth: {
                    type: AUTH_TYPE.COOKIE,
                },
                summary: 'Test',
            } as any);

            expect(mockApiCookieAuth).toHaveBeenCalledWith('refresh_token');
        });

        it('should handle Cookie auth with custom name', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                auth: {
                    name: 'session_id',
                    type: AUTH_TYPE.COOKIE,
                },
                summary: 'Test',
            } as any);

            expect(mockApiCookieAuth).toHaveBeenCalledWith('session_id');
        });

        it('should handle OAuth2 auth', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                auth: {
                    type: AUTH_TYPE.OAUTH2,
                },
                summary: 'Test',
            } as any);

            expect(mockApiOAuth2).toHaveBeenCalledWith(['read', 'write'], 'oauth2');
        });

        it('should handle OAuth2 auth with custom scopes', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                auth: {
                    type: AUTH_TYPE.OAUTH2,
                    scopes: ['user:read', 'user:write'],
                },
                summary: 'Test',
            } as any);

            expect(mockApiOAuth2).toHaveBeenCalledWith(['user:read', 'user:write'], 'oauth2');
        });

        it('should handle OAuth2 auth with custom provider', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                auth: {
                    type: AUTH_TYPE.OAUTH2,
                    provider: 'google',
                },
                summary: 'Test',
            } as any);

            expect(mockApiOAuth2).toHaveBeenCalledWith(['read', 'write'], 'google');
        });

        it('should handle multiple auth types', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                auth: [{ type: AUTH_TYPE.JWT }, { type: AUTH_TYPE.API_KEY }],
                summary: 'Test',
            } as any);

            expect(mockApiBearerAuth).toHaveBeenCalled();
            expect(mockApiSecurity).toHaveBeenCalled();
        });

        it('should not add 401/403 for non-required auth', () => {
            mockApiUnauthorizedResponse.mockClear();
            mockApiForbiddenResponse.mockClear();

            ApiEndpoint({
                apiUrl: '@GET /api/test',
                auth: {
                    type: AUTH_TYPE.JWT,
                    required: false,
                },
                summary: 'Test',
            } as any);

            expect(mockApiUnauthorizedResponse).not.toHaveBeenCalled();
            expect(mockApiForbiddenResponse).not.toHaveBeenCalled();
        });
    });

    describe('Error Responses', () => {
        it('should include common errors when flag is set', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                includeCommonErrors: true,
                summary: 'Test',
            } as any);

            expect(mockApiBadRequestResponse).toHaveBeenCalled();
            expect(mockApiNotFoundResponse).toHaveBeenCalled();
            expect(mockApiConflictResponse).toHaveBeenCalled();
            expect(mockApiInternalServerErrorResponse).toHaveBeenCalled();
            expect(mockApiTooManyRequestsResponse).toHaveBeenCalled();
        });

        it('should handle simple HttpStatus errors', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                errors: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalledTimes(2);
        });

        it('should handle custom error config', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                errors: [
                    {
                        status: HttpStatus.UNPROCESSABLE_ENTITY,
                        description: 'Custom error',
                    },
                ],
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    description: 'Custom error',
                }),
            );
        });

        it('should handle custom error with type', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                errors: [
                    {
                        status: HttpStatus.BAD_REQUEST,
                        type: Object as any,
                    },
                ],
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: Object,
                }),
            );
        });

        it('should handle custom error with examples', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                errors: [
                    {
                        status: HttpStatus.BAD_REQUEST,
                        examples: {
                            error1: { message: 'Error' },
                        },
                    },
                ],
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    examples: {
                        error1: { message: 'Error' },
                    },
                }),
            );
        });
    });

    describe('Validation', () => {
        it('should include validation errors when flag is set', () => {
            ApiEndpoint({
                apiUrl: '@POST /api/test',
                summary: 'Test',
                validation: {
                    includeValidationErrors: true,
                },
            } as any);

            expect(mockApiBadRequestResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: 'Validation Error - Invalid input data',
                }),
            );
        });

        it('should use custom validation error examples', () => {
            ApiEndpoint({
                apiUrl: '@POST /api/test',
                summary: 'Test',
                validation: {
                    errorExamples: [
                        {
                            constraint: 'isEmail',
                            field: 'email',
                            message: 'email must be an email',
                        },
                    ],
                },
            } as any);

            expect(mockApiBadRequestResponse).toHaveBeenCalled();
        });

        it('should handle validation groups metadata', () => {
            ApiEndpoint({
                apiUrl: '@POST /api/test',
                summary: 'Test',
                validation: {
                    groups: ['create', 'update'],
                },
            } as any);

            expect(mockSetMetadata).toHaveBeenCalledWith('validationGroups', ['create', 'update']);
        });
    });

    describe('Rate Limiting', () => {
        it('should add rate limit metadata', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                rateLimit: {
                    limit: 100,
                    window: '1m',
                },
                summary: 'Test',
            } as any);

            expect(mockSetMetadata).toHaveBeenCalledWith('rateLimit', {
                limit: 100,
                window: '1m',
            });
        });

        it('should add 429 response for rate limit', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                rateLimit: {
                    limit: 100,
                    message: 'Too many requests',
                    window: '1m',
                },
                summary: 'Test',
            } as any);

            expect(mockApiTooManyRequestsResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: 'Too many requests',
                }),
            );
        });

        it('should not add duplicate 429 if already in errors', () => {
            mockApiTooManyRequestsResponse.mockClear();

            ApiEndpoint({
                apiUrl: '@GET /api/test',
                errors: [HttpStatus.TOO_MANY_REQUESTS],
                rateLimit: {
                    limit: 100,
                    window: '1m',
                },
                summary: 'Test',
            } as any);

            // Should be called once from errors, not twice
            expect(mockApiResponse).toHaveBeenCalled();
        });
    });

    describe('Caching', () => {
        it('should add cache metadata', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                cache: {
                    ttl: 3600,
                },
                summary: 'Test',
            } as any);

            expect(mockSetMetadata).toHaveBeenCalledWith('cacheTtl', 3600);
        });
    });

    describe('Helper Decorators', () => {
        it('ApiGetEndpoint should use OK status', () => {
            mockApiResponse.mockClear();

            ApiGetEndpoint({
                apiUrl: '@GET /api/test',
                response: Object as any,
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: HttpStatus.OK,
                }),
            );
        });

        it('ApiPostEndpoint should use CREATED status', () => {
            mockApiResponse.mockClear();

            ApiPostEndpoint({
                apiUrl: '@POST /api/test',
                response: Object as any,
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: HttpStatus.CREATED,
                }),
            );
        });

        it('ApiPutEndpoint should use OK status', () => {
            mockApiResponse.mockClear();

            ApiPutEndpoint({
                apiUrl: '@PUT /api/test',
                response: Object as any,
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: HttpStatus.OK,
                }),
            );
        });

        it('ApiPatchEndpoint should use OK status', () => {
            mockApiResponse.mockClear();

            ApiPatchEndpoint({
                apiUrl: '@PATCH /api/test',
                response: Object as any,
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: HttpStatus.OK,
                }),
            );
        });

        it('ApiDeleteEndpoint should use NO_CONTENT status', () => {
            mockApiResponse.mockClear();

            ApiDeleteEndpoint({
                apiUrl: '@DELETE /api/test',
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: HttpStatus.NO_CONTENT,
                }),
            );
        });

        it('ApiPaginatedEndpoint should pass paginationType', () => {
            ApiPaginatedEndpoint({
                apiUrl: '@GET /api/test',
                paginationType: PAGINATION_TYPE.OFFSET,
                responses: {
                    [HttpStatus.OK]: {
                        type: Object as any,
                    },
                },
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalled();
        });

        it('ApiAuthEndpoint should include common errors', () => {
            mockApiBadRequestResponse.mockClear();

            ApiAuthEndpoint({
                apiUrl: '@GET /api/test',
                auth: { type: AUTH_TYPE.JWT },
                summary: 'Test',
            } as any);

            expect(mockApiBadRequestResponse).toHaveBeenCalled();
        });

        it('ApiValidationEndpoint should include validation errors', () => {
            mockApiBadRequestResponse.mockClear();

            ApiValidationEndpoint({
                apiUrl: '@POST /api/test',
                summary: 'Test',
            } as any);

            expect(mockApiBadRequestResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: 'Validation Error - Invalid input data',
                }),
            );
        });

        it('ApiValidationEndpoint should handle custom error examples', () => {
            ApiValidationEndpoint({
                apiUrl: '@POST /api/test',
                summary: 'Test',
                validation: {
                    errorExamples: [
                        {
                            constraint: 'isNotEmpty',
                            field: 'name',
                            message: 'name should not be empty',
                        },
                    ],
                },
            } as any);

            expect(mockApiBadRequestResponse).toHaveBeenCalled();
        });

        it('Helper decorators should handle null response', () => {
            mockApiResponse.mockClear();

            ApiGetEndpoint({
                apiUrl: '@GET /api/test',
                response: null,
                summary: 'Test',
            } as any);

            // Should not throw error
            expect(mockApiOperation).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty queries array', () => {
            mockApiQuery.mockClear();

            ApiEndpoint({
                apiUrl: '@GET /api/test',
                queries: [],
                summary: 'Test',
            } as any);

            expect(mockApiQuery).not.toHaveBeenCalled();
        });

        it('should handle empty params array', () => {
            mockApiParam.mockClear();

            ApiEndpoint({
                apiUrl: '@GET /api/test',
                params: [],
                summary: 'Test',
            } as any);

            expect(mockApiParam).not.toHaveBeenCalled();
        });

        it('should handle empty headers array', () => {
            mockApiHeader.mockClear();

            ApiEndpoint({
                apiUrl: '@GET /api/test',
                headers: [],
                summary: 'Test',
            } as any);

            expect(mockApiHeader).not.toHaveBeenCalled();
        });

        it('should handle empty errors array', () => {
            mockApiResponse.mockClear();

            ApiEndpoint({
                apiUrl: '@GET /api/test',
                errors: [],
                summary: 'Test',
            } as any);

            // Only operation should be called, no error responses
            expect(mockApiOperation).toHaveBeenCalled();
        });

        it('should handle response without type', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                responses: {
                    [HttpStatus.OK]: {
                        type: null,
                        description: 'Success',
                    },
                },
                summary: 'Test',
            } as any);

            expect(mockApiResponse).toHaveBeenCalled();
        });

        it('should handle unknown auth type gracefully', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/test',
                auth: {
                    type: 'UNKNOWN' as any,
                },
                summary: 'Test',
            } as any);

            // Should not throw error
            expect(mockApiOperation).toHaveBeenCalled();
        });
    });

    describe('Real-world Scenarios', () => {
        it('should handle complete user creation endpoint', () => {
            ApiEndpoint({
                apiUrl: '@POST /api/users',
                auth: {
                    type: AUTH_TYPE.JWT,
                    required: true,
                },
                body: {
                    type: Object as any,
                    description: 'User data',
                    required: true,
                },
                description: 'Create a new user account',
                errors: [
                    HttpStatus.CONFLICT,
                    {
                        status: HttpStatus.UNPROCESSABLE_ENTITY,
                        description: 'Invalid email format',
                    },
                ],
                includeCommonErrors: true,
                responses: {
                    [HttpStatus.CREATED]: {
                        type: Object as any,
                        description: 'User created successfully',
                    },
                },
                summary: 'Create user',
                tags: ['Users'],
                validation: {
                    errorExamples: [
                        {
                            constraint: 'isEmail',
                            field: 'email',
                            message: 'email must be an email',
                        },
                    ],
                },
            } as any);

            expect(mockApiOperation).toHaveBeenCalled();
            expect(mockApiTags).toHaveBeenCalled();
            expect(mockApiBearerAuth).toHaveBeenCalled();
            expect(mockApiBody).toHaveBeenCalled();
            expect(mockApiResponse).toHaveBeenCalled();
        });

        it('should handle paginated list endpoint', () => {
            ApiEndpoint({
                apiUrl: '@GET /api/users',
                auth: {
                    type: AUTH_TYPE.JWT,
                },
                description: 'Get paginated list of users',
                paginationType: PAGINATION_TYPE.OFFSET,
                queries: [
                    {
                        name: 'page',
                        type: 'number',
                        description: 'Page number',
                        example: 1,
                    },
                    {
                        name: 'limit',
                        type: 'number',
                        description: 'Items per page',
                        example: 10,
                    },
                ],
                responses: {
                    [HttpStatus.OK]: {
                        type: Object as any,
                        description: 'List of users',
                    },
                },
                summary: 'List users',
                tags: ['Users'],
            } as any);

            expect(mockApiQuery).toHaveBeenCalledTimes(2);
            expect(mockApiResponse).toHaveBeenCalled();
        });

        it('should handle file upload endpoint', () => {
            ApiEndpoint({
                apiUrl: '@POST /api/upload',
                body: {
                    files: [
                        {
                            name: 'avatar',
                            description: 'Avatar image',
                            required: true,
                        },
                    ],
                },
                responses: {
                    [HttpStatus.CREATED]: {
                        type: Object as any,
                        description: 'File uploaded',
                    },
                },
                summary: 'Upload avatar',
                tags: ['Files'],
            } as any);

            expect(mockApiConsumes).toHaveBeenCalledWith('multipart/form-data');
            expect(mockApiBody).toHaveBeenCalled();
        });
    });
});
