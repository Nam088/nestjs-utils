/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import type { Type } from '@nestjs/common';
import { applyDecorators, HttpStatus, SetMetadata } from '@nestjs/common';

import type { ApiParamOptions } from '@nestjs/swagger';
import {
    ApiBadRequestResponse,
    ApiBasicAuth,
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiConsumes,
    ApiCookieAuth,
    ApiForbiddenResponse,
    ApiHeader,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOAuth2,
    ApiOperation,
    ApiParam,
    ApiProduces,
    ApiQuery,
    ApiResponse,
    ApiSecurity,
    ApiTags,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { get, isArray, isEmpty, isNumber, keyBy, map, mapValues, set } from 'lodash';

import { AUTH_TYPE } from '../constants';
import { PAGINATION_TYPE } from '../constants/pagination.constants';
import { ApiResponseDto } from '../dto/api.response.dto';
import { ErrorResponseDto } from '../dto/error.response.dto';
import { ApiCursorPaginatedResponseDto, ApiPaginatedResponseDto } from '../dto/paginated.response.dto';

import type { PaginationType } from '../constants/pagination.constants';

// --- Enhanced Types for configuration ---
/**
 * Individual authentication configurations
 */
interface ApiKeyAuthConfig {
    provider?: string; // Name of the API Key provider
    required?: boolean;
    type: typeof AUTH_TYPE.API_KEY;
}

interface BasicAuthConfig {
    required?: boolean;
    type: typeof AUTH_TYPE.BASIC;
}

interface CookieAuthConfig {
    name?: string;
    required?: boolean;
    type: typeof AUTH_TYPE.COOKIE;
}

interface JwtAuthConfig {
    provider?: string; // Name of the JWT provider
    required?: boolean;
    type: typeof AUTH_TYPE.JWT;
}

interface OAuth2AuthConfig {
    provider?: string; // Name of the OAuth2 provider
    required?: boolean;
    scopes?: string[];
    type: typeof AUTH_TYPE.OAUTH2;
}

/**
 * Union type for all auth configurations
 */
type AuthConfig = ApiKeyAuthConfig | BasicAuthConfig | CookieAuthConfig | JwtAuthConfig | OAuth2AuthConfig;

/**
 * Custom error response configuration
 */
interface CustomErrorConfig {
    description?: string;
    examples?: Record<string, unknown>;
    status: HttpStatus;
    type?: Type<unknown>;
}

/**
 * Request body configuration
 */
interface BodyConfig {
    description?: string;
    examples?: Record<string, unknown>;
    files?: { description?: string; isArray?: boolean; name: string; required?: boolean }[];
    required?: boolean;
    type?: Type<unknown>;
}

/**
 * Query parameter configuration
 */
interface QueryConfig {
    description?: string;
    enum?: unknown[];
    example?: unknown;
    name: string;
    required?: boolean;
    type?: 'array' | 'boolean' | 'number' | 'string';
}

/**
 * Path parameter configuration
 */
interface ParamConfig {
    description?: string;
    example?: number | string;
    format?: string;
    name: string;
    type?: 'number' | 'string' | 'uuid';
}

/**
 * Header configuration
 */
interface HeaderConfig {
    description?: string;
    example?: string;
    name: string;
    required?: boolean;
}

/**
 * Response configuration with multiple status codes
 */
interface ResponseConfig<T> {
    description?: string;
    examples?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    isArray?: boolean;
    type: null | Type<T>;
}

/**
 * Validation error example configuration
 */
interface ValidationErrorExample {
    constraint: string;
    field: string;
    message: string;
}

/**
 * Enhanced options for configuring the ApiEndpoint decorator
 */
interface ApiEndpointOptions<T> {
    // Basic configuration
    deprecated?: boolean;
    description?: string;
    summary: string;
    tags?: string | string[];

    // Response configuration
    paginationType?: PaginationType;
    responses?: Partial<Record<HttpStatus, ResponseConfig<T>>>;

    // Authentication
    auth?: AuthConfig | AuthConfig[];

    // Request configuration
    body?: BodyConfig;
    headers?: HeaderConfig[];
    params?: ParamConfig[];
    queries?: QueryConfig[];

    // Content type configuration
    consumes?: string[];
    produces?: string[];

    // Error handling
    errors?: (CustomErrorConfig | HttpStatus)[];
    includeCommonErrors?: boolean; // Auto-include 400, 404, 500 etc.

    // Rate limiting
    rateLimit?: {
        limit: number;
        message?: string;
        window: string;
    };

    // Caching
    cache?: {
        description?: string;
        ttl?: number;
    };

    // Additional metadata
    externalDocs?: {
        description: string;
        url: string;
    };
    operationId?: string;

    // Validation
    validation?: {
        errorExamples?: ValidationErrorExample[];
        groups?: string[];
        includeValidationErrors?: boolean; // Auto-include 400 with validation error format
    };
}

// --- Enhanced mapping for Swagger decorators ---

/**
 * Create API Key decorator
 */
const createApiKeyDecorator = (config: ApiKeyAuthConfig): MethodDecorator[] => {
    const decorators: MethodDecorator[] = [];
    const providerName = config.provider || 'api-key';

    // Add API Security decorator
    decorators.push(ApiSecurity(providerName));

    return decorators;
};

/**
 * Create authentication decorators based on auth configuration
 */
const createAuthDecorators = (authConfig: AuthConfig | AuthConfig[]): MethodDecorator[] => {
    const decorators: MethodDecorator[] = [];
    const authConfigs = Array.isArray(authConfig) ? authConfig : [authConfig];

    // Add JWT providers
    const jwtProviders = authConfigs.filter((config) => config.type === AUTH_TYPE.JWT);

    if (jwtProviders.length > 0) {
        // Add individual Bearer Auth for each provider
        jwtProviders.forEach((provider) => {
            const providerName = provider.provider || 'bearer';

            decorators.push(ApiBearerAuth(providerName));
        });
    }

    // Add other auth types
    authConfigs.forEach((config) => {
        switch (config.type) {
            case AUTH_TYPE.API_KEY: {
                const apiKeyDecorators = createApiKeyDecorator(config);

                decorators.push(...apiKeyDecorators);
                break;
            }

            case AUTH_TYPE.BASIC: {
                decorators.push(ApiBasicAuth());
                break;
            }

            case AUTH_TYPE.COOKIE: {
                const cookieName = config.name || 'refresh_token';

                decorators.push(ApiCookieAuth(cookieName));
                break;
            }

            case AUTH_TYPE.OAUTH2: {
                const scopes = config.scopes || ['read', 'write'];
                const providerName = config.provider || 'oauth2';

                decorators.push(ApiOAuth2(scopes, providerName));
                break;
            }

            default: {
                // Remove console.warn to fix no-console lint error
                break;
            }
        }
    });

    return decorators;
};

/**
 * Create common error response decorators
 */
const createCommonErrorDecorators = (): MethodDecorator[] => [
    ApiBadRequestResponse({
        type: ErrorResponseDto,
        description: 'Bad Request - Invalid input data',
        examples: {
            'Bad Request': {
                summary: 'Bad Request Example',
                value: {
                    error: 'Bad Request',
                    message: 'Invalid input data provided',
                    path: '/api/example',
                    statusCode: 400,
                    timestamp: '2025-01-15T10:30:00.000Z',
                    requestId: 'abc123-def456-ghi789',
                },
            },
        },
    }),
    ApiNotFoundResponse({
        type: ErrorResponseDto,
        description: 'Resource not found',
        examples: {
            'Not Found': {
                summary: 'Not Found Example',
                value: {
                    error: 'Not Found',
                    message: 'The requested resource was not found',
                    path: '/api/example',
                    statusCode: 404,
                    timestamp: '2025-01-15T10:30:00.000Z',
                    requestId: 'abc123-def456-ghi789',
                },
            },
        },
    }),
    ApiConflictResponse({
        type: ErrorResponseDto,
        description: 'Conflict - Resource already exists or constraint violation',
        examples: {
            Conflict: {
                summary: 'Conflict Example',
                value: {
                    error: 'Conflict',
                    message: 'Resource already exists or constraint violation',
                    path: '/api/example',
                    statusCode: 409,
                    timestamp: '2025-01-15T10:30:00.000Z',
                    requestId: 'abc123-def456-ghi789',
                },
            },
        },
    }),
    ApiInternalServerErrorResponse({
        type: ErrorResponseDto,
        description: 'Internal Server Error',
        examples: {
            'Internal Server Error': {
                summary: 'Internal Server Error Example',
                value: {
                    error: 'Internal Server Error',
                    message: 'An unexpected error occurred while processing your request',
                    path: '/api/example',
                    statusCode: 500,
                    timestamp: '2025-01-15T10:30:00.000Z',
                    requestId: 'abc123-def456-ghi789',
                },
            },
        },
    }),
    ApiTooManyRequestsResponse({
        type: ErrorResponseDto,
        description: 'Too Many Requests - Rate limit exceeded',
        examples: {
            'Too Many Requests': {
                summary: 'Rate Limit Exceeded Example',
                value: {
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded. Please try again later',
                    path: '/api/example',
                    statusCode: 429,
                    timestamp: '2025-01-15T10:30:00.000Z',
                    requestId: 'abc123-def456-ghi789',
                },
            },
        },
    }),
];

/**
 * Create validation error response example
 */
const createValidationErrorExample = (errorExamples: ValidationErrorExample[]) => {
    const fieldErrors: Record<string, Record<string, string>> = {};
    const errors: string[] = [];

    errorExamples.forEach(({ constraint, field, message }) => {
        if (isEmpty(get(fieldErrors, field))) {
            set(fieldErrors, field, {});
        }

        set(fieldErrors, [field, constraint], message);
        errors.push(message);
    });

    return {
        error: 'Validation failed',
        errors,
        fieldErrors,
        message: 'Validation failed',
        path: '/api/example',
        statusCode: 400,
        timestamp: '2025-01-15T10:30:00.000Z',
        requestId: 'abc123-def456-ghi789',
    };
};

/**
 * Create custom error decorators
 */
const createCustomErrorDecorators = (errors: (CustomErrorConfig | HttpStatus)[]): MethodDecorator[] =>
    map(errors, (error) => {
        if (isNumber(error)) {
            // Simple HttpStatus
            return ApiResponse({
                status: error,
                type: ErrorResponseDto,
                description: getHttpStatusDescription(error),
                examples: {
                    [getHttpStatusDescription(error)]: {
                        summary: `${getHttpStatusDescription(error)} Example`,
                        value: {
                            error: getHttpStatusDescription(error),
                            message: getDefaultErrorMessage(error),
                            path: '/api/example',
                            statusCode: error,
                            timestamp: '2025-01-15T10:30:00.000Z',
                            requestId: 'abc123-def456-ghi789',
                        },
                    },
                },
            });
        }

        // Custom error configuration
        return ApiResponse({
            status: error.status,
            type: error.type || ErrorResponseDto,
            description: error.description || getHttpStatusDescription(error.status),
            ...(error.examples && { examples: error.examples }),
        });
    });

/**
 * Get default description for HTTP status codes
 */
const getHttpStatusDescription = (status: HttpStatus): string => {
    const statusDescriptions: Partial<Record<HttpStatus, string>> = {
        [HttpStatus.BAD_REQUEST]: 'Bad Request',
        [HttpStatus.CONFLICT]: 'Conflict',
        [HttpStatus.FORBIDDEN]: 'Forbidden',
        [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
        [HttpStatus.NOT_FOUND]: 'Not Found',
        [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
        [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
        [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
        [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
    };

    return get(statusDescriptions, status, `HTTP ${status}`);
};

/**
 * Get default error message for HTTP status codes
 */
const getDefaultErrorMessage = (status: HttpStatus): string => {
    const errorMessages: Partial<Record<HttpStatus, string>> = {
        [HttpStatus.BAD_REQUEST]: 'Invalid input data provided',
        [HttpStatus.CONFLICT]: 'Resource already exists or constraint violation',
        [HttpStatus.FORBIDDEN]: 'Insufficient permissions',
        [HttpStatus.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred while processing your request',
        [HttpStatus.NOT_FOUND]: 'The requested resource was not found',
        [HttpStatus.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable',
        [HttpStatus.TOO_MANY_REQUESTS]: 'Rate limit exceeded. Please try again later',
        [HttpStatus.UNAUTHORIZED]: 'Invalid or missing authentication',
        [HttpStatus.UNPROCESSABLE_ENTITY]: 'The request data is invalid',
    };

    return get(errorMessages, status, 'An error occurred');
};

/**
 * Normalize response configuration
 */
const normalizeResponseConfig = <T>(
    response: null | ResponseConfig<T> | Type<T> | undefined,
): null | ResponseConfig<T> => {
    if (!response) return null;

    if (typeof response === 'function') {
        // It's a Type<T>
        return { type: response };
    }

    return response;
};

/**
 * Helper to get paginated type
 */
const getPaginatedType = <T>(pagination: PaginationType | undefined, type: Type<T>): Type<unknown> => {
    if (pagination === PAGINATION_TYPE.OFFSET) {
        return ApiPaginatedResponseDto(type);
    } else if (pagination === PAGINATION_TYPE.CURSOR) {
        return ApiCursorPaginatedResponseDto(type);
    }

    return ApiResponseDto(type);
};

/**
 * Enhanced decorator to standardize Swagger documentation and API response structure.
 * Provides comprehensive configuration options for modern API documentation.
 *
 * @param {ApiEndpointOptions<T>} options - The configuration for the endpoint's documentation
 * @returns {MethodDecorator} - A decorator that applies comprehensive Swagger documentation
 *
 * @example
 * ```typescript
 * @ApiEndpoint({
 *   summary: 'Create a new user',
 *   description: 'Creates a new user account with the provided information',
 *   tags: ['Users'],
 *   responses: { [HttpStatus.CREATED]: { type: UserDto, description: 'User created' } },
 *   auth: { type: AUTH_TYPE.JWT, required: true },
 *   body: {
 *     type: CreateUserDto,
 *     description: 'User creation data',
 *     examples: { user: { name: 'John', email: 'john@example.com' } }
 *   },
 *   queries: [
 *     { name: 'sendEmail', type: 'boolean', description: 'Send welcome email' }
 *   ],
 *   errors: [
 *     HttpStatus.CONFLICT,
 *     { status: HttpStatus.UNPROCESSABLE_ENTITY, description: 'Invalid email format' }
 *   ],
 *   includeCommonErrors: true,
 *   validation: {
 *     includeValidationErrors: true,
 *     errorExamples: [
 *       { field: 'email', constraint: 'isEmail', message: 'email must be an email' },
 *       { field: 'password', constraint: 'minLength', message: 'password must be longer than or equal to 8 characters' }
 *     ]
 *   }
 * })
 *
 * // Multiple auth types
 * @ApiEndpoint({
 *   summary: 'Multi-auth endpoint',
 *   response: UserDto,
 *   auth: [
 *     { type: AUTH_TYPE.JWT, required: true },
 *     { type: AUTH_TYPE.API_KEY, name: 'X-Custom-Key' }
 *   ]
 * })
 *
 * // OAuth2 with custom scopes
 * @ApiEndpoint({
 *   summary: 'OAuth2 endpoint',
 *   response: UserDto,
 *   auth: { type: AUTH_TYPE.OAUTH2, scopes: ['user:read', 'user:write'] }
 * })
 *
 * // Using shorthand for validation
 * @ApiValidationEndpoint({
 *   summary: 'Create user with validation docs',
 *   response: UserDto,
 *   body: { type: CreateUserDto },
 *   validation: {
 *     errorExamples: [
 *       { field: 'name', constraint: 'isNotEmpty', message: 'name should not be empty' },
 *       { field: 'email', constraint: 'isEmail', message: 'email must be an email' }
 *     ]
 *   }
 * })
 * ```
 */
export const ApiEndpoint = <T>(options: ApiEndpointOptions<T>): MethodDecorator => {
    const {
        auth,
        body,
        cache,
        consumes,
        deprecated = false,
        description = '',
        errors = [],
        externalDocs,
        headers = [],
        includeCommonErrors = false,
        paginationType,
        params = [],
        produces,
        queries = [],
        rateLimit,
        responses,
        summary,
        tags,
        validation,
        operationId,
    } = options;

    const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] = [];

    // 1. Set Swagger Operation
    const operationOptions: Record<string, unknown> = { description, summary };

    if (operationId) operationOptions.operationId = operationId;

    if (deprecated) operationOptions.deprecated = deprecated;

    if (externalDocs) operationOptions.externalDocs = externalDocs;

    decorators.push(ApiOperation(operationOptions));

    // 2. Set Tags
    if (tags) {
        const tagArray = isArray(tags) ? tags : [tags];

        decorators.push(ApiTags(...tagArray));
    }

    // 3. Set Content Type
    if (consumes && !isEmpty(consumes)) {
        decorators.push(ApiConsumes(...consumes));
    }

    if (produces && !isEmpty(produces)) {
        decorators.push(ApiProduces(...produces));
    }

    // 4. Set Request Body
    if (body) {
        const bodyOptions: Record<string, unknown> = {};

        if (body.type) bodyOptions.type = body.type;

        if (body.description) bodyOptions.description = body.description;

        if (body.required !== undefined) bodyOptions.required = body.required;

        if (body.examples) bodyOptions.examples = body.examples;

        if (body.files && !isEmpty(body.files)) {
            decorators.push(ApiConsumes('multipart/form-data'));
            bodyOptions.schema = {
                type: 'object',
                properties: mapValues(keyBy(body.files, 'name'), (file) => ({
                    type: file.isArray ? 'array' : 'string',
                    description: file.description,
                    format: 'binary',
                })),
                required: body.files.filter((f) => f.required).map((f) => f.name),
            };
        }

        decorators.push(ApiBody(bodyOptions));
    }

    // 5. Set Query Parameters
    queries.forEach((query: QueryConfig) => {
        const queryOptions: Record<string, unknown> = {
            name: query.name,
            required: query.required || false,
        };

        if (query.type) queryOptions.type = query.type;

        if (query.description) queryOptions.description = query.description;

        if (query.example !== undefined) queryOptions.example = query.example;

        if (query.enum) queryOptions.enum = query.enum;

        decorators.push(ApiQuery(queryOptions));
    });

    // 6. Set Path Parameters
    params.forEach((param: ParamConfig) => {
        const isUuid = param.type === 'uuid';
        const schema: { example?: number | string; format?: string; type: 'number' | 'string' } = {
            type: (isUuid ? 'string' : (param.type ?? 'string')) as 'number' | 'string',
            ...(param.format || isUuid ? { format: param.format ?? 'uuid' } : {}),
            ...(param.example !== undefined ? { example: param.example } : {}),
        };

        const paramOptions: ApiParamOptions = {
            name: param.name,
            description: param.description,
            required: true,
            schema,
        };

        decorators.push(ApiParam(paramOptions));
    });

    // 7. Set Headers
    headers.forEach((header: HeaderConfig) => {
        const headerOptions = {
            name: header.name,
            required: header.required || false,
            ...(header.description && { description: header.description }),
            ...(header.example && { example: header.example }),
        };

        decorators.push(ApiHeader(headerOptions));
    });

    // 8. Set Success Responses
    if (responses) {
        Object.entries(responses).forEach(([statusCode, config]) => {
            const numStatus = Number(statusCode);
            const responseConfig = normalizeResponseConfig(config);

            if (responseConfig) {
                const responseOptions: Record<string, unknown> = {
                    status: numStatus,
                    description: responseConfig.description,
                };

                if (responseConfig.type) {
                    responseOptions.type = getPaginatedType(paginationType, responseConfig.type);
                    responseOptions.isArray = responseConfig.isArray || false;
                }

                if (responseConfig.examples) responseOptions.examples = responseConfig.examples;

                if (responseConfig.headers) responseOptions.headers = responseConfig.headers;

                decorators.push(ApiResponse(responseOptions));
            }
        });
    }

    // 9. Apply Authentication Decorators
    if (auth) {
        const authConfigs = Array.isArray(auth) ? auth : [auth];
        const authDecorators = createAuthDecorators(auth);

        decorators.push(...authDecorators);

        // Automatically add 401 and 403 for authenticated endpoints
        const hasRequiredAuth = authConfigs.some((config) => config.required !== false);

        if (hasRequiredAuth) {
            decorators.push(
                ApiUnauthorizedResponse({
                    type: ErrorResponseDto,
                    description: 'Unauthorized - Invalid or missing authentication',
                    examples: {
                        Unauthorized: {
                            summary: 'Unauthorized Example',
                            value: {
                                error: 'Unauthorized',
                                message: 'Invalid or missing authentication',
                                path: '/api/example',
                                statusCode: 401,
                                timestamp: '2025-01-15T10:30:00.000Z',
                                requestId: 'abc123-def456-ghi789',
                            },
                        },
                    },
                }),
            );
            decorators.push(
                ApiForbiddenResponse({
                    type: ErrorResponseDto,
                    description: 'Forbidden - Insufficient permissions',
                    examples: {
                        Forbidden: {
                            summary: 'Forbidden Example',
                            value: {
                                error: 'Forbidden',
                                message: 'Insufficient permissions',
                                path: '/api/example',
                                statusCode: 403,
                                timestamp: '2025-01-15T10:30:00.000Z',
                                requestId: 'abc123-def456-ghi789',
                            },
                        },
                    },
                }),
            );
        }
    }

    // 10. Apply Common Error Responses
    if (includeCommonErrors) {
        const commonErrorDecorators = createCommonErrorDecorators();

        decorators.push(...commonErrorDecorators);
    }

    // 11. Apply Custom Error Responses
    if (!isEmpty(errors)) {
        const customErrorDecorators = createCustomErrorDecorators(errors);

        decorators.push(...customErrorDecorators);
    }

    // 12. Apply Validation Error Documentation
    if (validation?.includeValidationErrors || validation?.errorExamples) {
        const validationErrorExamples: ValidationErrorExample[] = validation.errorExamples || [
            { constraint: 'isEmail', field: 'email', message: 'email must be an email' },
            {
                constraint: 'minLength',
                field: 'password',
                message: 'password must be longer than or equal to 8 characters',
            },
        ];

        const validationErrorExample = createValidationErrorExample(validationErrorExamples);

        decorators.push(
            ApiBadRequestResponse({
                type: ErrorResponseDto,
                description: 'Validation Error - Invalid input data',
                examples: {
                    'Validation Error': {
                        summary: 'Validation Error Example',
                        value: validationErrorExample,
                    },
                },
            }),
        );
    }

    // 13. Apply Rate Limit and Cache Metadata
    if (rateLimit) {
        decorators.push(SetMetadata('rateLimit', rateLimit));

        // Auto-add 429 if not present
        if (
            !errors.some((e) =>
                isNumber(e) ? e === HttpStatus.TOO_MANY_REQUESTS : e.status === HttpStatus.TOO_MANY_REQUESTS,
            )
        ) {
            decorators.push(
                ApiTooManyRequestsResponse({
                    type: ErrorResponseDto,
                    description: rateLimit.message || 'Rate limit exceeded',
                }),
            );
        }
    }

    if (cache) {
        decorators.push(SetMetadata('cacheTtl', cache.ttl));
    }

    // 14. Apply Validation Metadata
    if (validation?.groups) {
        decorators.push(SetMetadata('validationGroups', validation.groups));
    }

    return applyDecorators(...decorators);
};

// --- Helper decorators for common patterns ---

/**
 * Shorthand for GET endpoints
 */
export const ApiGetEndpoint = <T>(
    options: Omit<ApiEndpointOptions<T>, 'responses'> & { response?: null | ResponseConfig<T> | Type<T> },
) => {
    const responses = options.response
        ? { [HttpStatus.OK]: normalizeResponseConfig(options.response) || { type: null } }
        : undefined;

    return ApiEndpoint({ ...options, responses });
};

/**
 * Shorthand for POST endpoints
 */
export const ApiPostEndpoint = <T>(
    options: Omit<ApiEndpointOptions<T>, 'responses'> & { response?: null | ResponseConfig<T> | Type<T> },
) => {
    const responses = options.response
        ? { [HttpStatus.CREATED]: normalizeResponseConfig(options.response) || { type: null } }
        : undefined;

    return ApiEndpoint({ ...options, responses });
};

/**
 * Shorthand for PUT endpoints
 */
export const ApiPutEndpoint = <T>(
    options: Omit<ApiEndpointOptions<T>, 'responses'> & { response?: null | ResponseConfig<T> | Type<T> },
) => {
    const responses = options.response
        ? { [HttpStatus.OK]: normalizeResponseConfig(options.response) || { type: null } }
        : undefined;

    return ApiEndpoint({ ...options, responses });
};

/**
 * Shorthand for PATCH endpoints
 */
export const ApiPatchEndpoint = <T>(
    options: Omit<ApiEndpointOptions<T>, 'responses'> & { response?: null | ResponseConfig<T> | Type<T> },
) => {
    const responses = options.response
        ? { [HttpStatus.OK]: normalizeResponseConfig(options.response) || { type: null } }
        : undefined;

    return ApiEndpoint({ ...options, responses });
};

/**
 * Shorthand for DELETE endpoints
 */
export const ApiDeleteEndpoint = <T>(options: Omit<ApiEndpointOptions<T>, 'responses'>) =>
    ApiEndpoint({
        ...options,
        responses: { [HttpStatus.NO_CONTENT]: { type: null, description: 'Deleted successfully' } },
    });

/**
 * Shorthand for paginated endpoints
 */
export const ApiPaginatedEndpoint = <T>(
    options: Omit<ApiEndpointOptions<T>, 'paginationType'> & {
        paginationType: PaginationType;
    },
) => ApiEndpoint(options);

/**
 * Shorthand for authenticated endpoints
 */
export const ApiAuthEndpoint = <T>(
    options: Omit<ApiEndpointOptions<T>, 'auth'> & {
        auth: AuthConfig | AuthConfig[];
    },
) => ApiEndpoint({ ...options, includeCommonErrors: true });

/**
 * Shorthand for endpoints with validation error documentation
 */
export const ApiValidationEndpoint = <T>(
    options: Omit<ApiEndpointOptions<T>, 'validation'> & {
        validation?: {
            errorExamples?: ValidationErrorExample[];
            groups?: string[];
        };
    },
) =>
    ApiEndpoint({
        ...options,
        validation: {
            ...options.validation,
            includeValidationErrors: true,
        },
    });
