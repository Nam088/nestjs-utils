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
import type { ApiRoute } from '../types/api-route.type';

/**
 * Enhanced options for configuring the ApiEndpoint decorator.
 * Provides comprehensive configuration for API endpoint documentation and behavior.
 * @template T - Type of the response data
 */
interface ApiEndpointOptions<T> {
    // API Route for tracing and documentation (required for better code tracing)
    // Format: @METHOD /path/to/endpoint (e.g., @POST /api/v1/auth/register)
    apiUrl: ApiRoute;

    // Authentication
    auth?: AuthConfig | AuthConfig[];
    // Request configuration
    body?: BodyConfig;
    // Caching
    cache?: {
        description?: string;
        ttl?: number;
    };
    // Content type configuration
    consumes?: string[];

    // Basic configuration
    deprecated?: boolean;
    description?: string;

    // Error handling
    errors?: (CustomErrorConfig | HttpStatus)[];

    // Additional metadata
    externalDocs?: {
        description: string;
        url: string;
    };
    headers?: HeaderConfig[];
    includeCommonErrors?: boolean; // Auto-include 400, 404, 500 etc.
    operationId?: string;

    // Response configuration
    paginationType?: PaginationType;
    params?: ParamConfig[];

    produces?: string[];
    queries?: QueryConfig[];

    // Rate limiting
    rateLimit?: {
        limit: number;
        message?: string;
        window: string;
    };

    responses?: Partial<Record<HttpStatus, ResponseConfig<T>>>;

    summary: string;
    tags?: string | string[];

    // Validation
    validation?: {
        errorExamples?: ValidationErrorExample[];
        groups?: string[];
        includeValidationErrors?: boolean; // Auto-include 400 with validation error format
    };
}

// --- Enhanced Types for configuration ---
/**
 * Individual authentication configurations.
 * Defines authentication settings for API key-based security.
 */
interface ApiKeyAuthConfig {
    /** Name of the API Key provider */
    provider?: string;
    /** Whether authentication is required */
    required?: boolean;
    /** Authentication type identifier */
    type: typeof AUTH_TYPE.API_KEY;
}

/**
 * Union type for all supported authentication configurations.
 * @example
 * const authConfig: AuthConfig = {
 *   type: AUTH_TYPE.JWT,
 *   provider: 'access-token',
 *   required: true
 * };
 */
type AuthConfig = ApiKeyAuthConfig | BasicAuthConfig | CookieAuthConfig | JwtAuthConfig | OAuth2AuthConfig;

/**
 * Basic authentication configuration.
 * Defines settings for HTTP Basic authentication.
 */
interface BasicAuthConfig {
    /** Whether authentication is required */
    required?: boolean;
    /** Authentication type identifier */
    type: typeof AUTH_TYPE.BASIC;
}

/**
 * Request body configuration.
 * Defines how request body should be documented and validated.
 */
interface BodyConfig {
    /** Description of the request body */
    description?: string;
    /** Example request body values */
    examples?: Record<string, unknown>;
    /** File upload configuration if applicable */
    files?: { description?: string; isArray?: boolean; name: string; required?: boolean }[];
    /** Whether the request body is required */
    required?: boolean;
    /** Type class for the request body */
    type?: Type<unknown>;
}

/**
 * Cookie-based authentication configuration.
 * Defines settings for cookie-based authentication.
 */
interface CookieAuthConfig {
    /** Name of the cookie */
    name?: string;
    /** Whether authentication is required */
    required?: boolean;
    /** Authentication type identifier */
    type: typeof AUTH_TYPE.COOKIE;
}

/**
 * Custom error response configuration.
 * Defines how custom error responses should be documented.
 */
interface CustomErrorConfig {
    /** Description of the error */
    description?: string;
    /** Example error responses */
    examples?: Record<string, unknown>;
    /** HTTP status code for the error */
    status: HttpStatus;
    /** Type class for the error response */
    type?: Type<unknown>;
}

/**
 * Header configuration.
 * Defines how custom headers should be documented.
 */
interface HeaderConfig {
    /** Description of the header */
    description?: string;
    /** Example value for the header */
    example?: string;
    /** Name of the header */
    name: string;
    /** Whether the header is required */
    required?: boolean;
}

/**
 * JWT authentication configuration.
 * Defines settings for JWT Bearer token authentication.
 */
interface JwtAuthConfig {
    /** Name of the JWT provider */
    provider?: string;
    /** Whether authentication is required */
    required?: boolean;
    /** Authentication type identifier */
    type: typeof AUTH_TYPE.JWT;
}

/**
 * OAuth2 authentication configuration.
 * Defines settings for OAuth2-based authentication with optional scopes.
 */
interface OAuth2AuthConfig {
    /** Name of the OAuth2 provider */
    provider?: string;
    /** Whether authentication is required */
    required?: boolean;
    /** OAuth2 scopes required for access */
    scopes?: string[];
    /** Authentication type identifier */
    type: typeof AUTH_TYPE.OAUTH2;
}

/**
 * Path parameter configuration.
 * Defines how URL path parameters should be documented and validated.
 */
interface ParamConfig {
    /** Description of the path parameter */
    description?: string;
    /** Example value for the parameter */
    example?: number | string;
    /** Format specification for the parameter */
    format?: string;
    /** Name of the path parameter */
    name: string;
    /** Type of the parameter */
    type?: 'number' | 'string' | 'uuid';
}

/**
 * Query parameter configuration.
 * Defines how query parameters should be documented and validated.
 */
interface QueryConfig {
    /** Description of the query parameter */
    description?: string;
    /** Enum values if parameter has restricted values */
    enum?: unknown[];
    /** Example value for the parameter */
    example?: unknown;
    /** Name of the query parameter */
    name: string;
    /** Whether the parameter is required */
    required?: boolean;
    /** Type of the parameter */
    type?: 'array' | 'boolean' | 'number' | 'string';
}

/**
 * Response configuration with multiple status codes.
 * @template T - Type of the response data
 */
interface ResponseConfig<T> {
    /** Description of the response */
    description?: string;
    /** Example response values */
    examples?: Record<string, unknown>;
    /** Response headers configuration */
    headers?: Record<string, unknown>;
    /** Whether the response is an array */
    isArray?: boolean;
    /** Type class for the response data */
    type: null | Type<T>;
}

/**
 * Validation error example configuration.
 * Defines structure for validation error examples in API documentation.
 */
interface ValidationErrorExample {
    /** Name of the validation constraint that failed */
    constraint: string;
    /** Field name that failed validation */
    field: string;
    /** Error message for the validation failure */
    message: string;
}

// --- Enhanced mapping for Swagger decorators ---

/**
 * Creates API Key authentication decorators based on configuration.
 * @param {ApiKeyAuthConfig} config - API key authentication configuration
 * @returns {MethodDecorator[]} Array of method decorators for API key auth
 */
const createApiKeyDecorator = (config: ApiKeyAuthConfig): MethodDecorator[] => {
    const decorators: MethodDecorator[] = [];
    const providerName = config.provider || 'api-key';

    // Add API Security decorator
    decorators.push(ApiSecurity(providerName));

    return decorators;
};

/**
 * Creates authentication decorators based on auth configuration.
 * @param {AuthConfig | AuthConfig[]} authConfig - Single or multiple auth configurations
 * @returns {MethodDecorator[]} Array of method decorators for authentication
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
 * Helper function to get paginated response type based on pagination configuration.
 * @template T - Type of the data items
 * @param {PaginationType | undefined} pagination - Type of pagination to use
 * @param {Type<T>} type - Data type class
 * @returns {Type<unknown>} Appropriate response DTO type for pagination
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
        apiUrl,
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

    // Add API URL to description for better tracing (required field)
    const enhancedDescription = description
        ? `${description}\n\n**API URL:** \`${apiUrl}\``
        : `**API URL:** \`${apiUrl}\``;

    operationOptions.description = enhancedDescription;

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
 * Shorthand decorator for GET endpoints with simplified response configuration.
 * @template T - Type of the response data
 * @param {Object} options - GET endpoint configuration options
 * @returns {MethodDecorator} Configured API endpoint decorator
 * @example
 * @ApiGetEndpoint({
 *   apiUrl: 'api/v1/users/:id',
 *   summary: 'Get user by ID',
 *   response: UserDto,
 *   params: [{ name: 'id', type: 'uuid' }]
 * })
 * getUser(@Param('id') id: string) {}
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
 * Shorthand decorator for POST endpoints with simplified response configuration.
 * @template T - Type of the response data
 * @param {Object} options - POST endpoint configuration options
 * @returns {MethodDecorator} Configured API endpoint decorator
 * @example
 * @ApiPostEndpoint({
 *   apiUrl: 'api/v1/users',
 *   summary: 'Create new user',
 *   response: UserDto,
 *   body: { type: CreateUserDto }
 * })
 * createUser(@Body() dto: CreateUserDto) {}
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
 * Shorthand decorator for PUT endpoints with simplified response configuration.
 * @template T - Type of the response data
 * @param {Object} options - PUT endpoint configuration options
 * @returns {MethodDecorator} Configured API endpoint decorator
 * @example
 * @ApiPutEndpoint({
 *   apiUrl: 'api/v1/users/:id',
 *   summary: 'Update user',
 *   response: UserDto,
 *   body: { type: UpdateUserDto }
 * })
 * updateUser(@Body() dto: UpdateUserDto) {}
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
 * Shorthand decorator for PATCH endpoints with simplified response configuration.
 * @template T - Type of the response data
 * @param {Object} options - PATCH endpoint configuration options
 * @returns {MethodDecorator} Configured API endpoint decorator
 * @example
 * @ApiPatchEndpoint({
 *   apiUrl: 'api/v1/users/:id',
 *   summary: 'Partially update user',
 *   response: UserDto,
 *   body: { type: PartialUpdateUserDto }
 * })
 * patchUser(@Body() dto: PartialUpdateUserDto) {}
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
 * Shorthand decorator for DELETE endpoints with no content response.
 * @template T - Type placeholder (not used for delete operations)
 * @param {Object} options - DELETE endpoint configuration options
 * @returns {MethodDecorator} Configured API endpoint decorator
 * @example
 * @ApiDeleteEndpoint({
 *   apiUrl: 'api/v1/users/:id',
 *   summary: 'Delete user',
 *   params: [{ name: 'id', type: 'uuid' }]
 * })
 * deleteUser(@Param('id') id: string) {}
 */
export const ApiDeleteEndpoint = <T>(options: Omit<ApiEndpointOptions<T>, 'responses'>) =>
    ApiEndpoint({
        ...options,
        responses: { [HttpStatus.NO_CONTENT]: { type: null, description: 'Deleted successfully' } },
    });

/**
 * Shorthand decorator for paginated endpoints with specified pagination type.
 * @template T - Type of the paginated data items
 * @param {Object} options - Paginated endpoint configuration options
 * @returns {MethodDecorator} Configured API endpoint decorator with pagination
 * @example
 * @ApiPaginatedEndpoint({
 *   summary: 'Get users with pagination',
 *   paginationType: PAGINATION_TYPE.OFFSET,
 *   responses: { [HttpStatus.OK]: { type: UserDto, isArray: true } }
 * })
 * getUsers(@Query() pagination: PaginationDto) {}
 */
export const ApiPaginatedEndpoint = <T>(
    options: Omit<ApiEndpointOptions<T>, 'paginationType'> & {
        paginationType: PaginationType;
    },
) => ApiEndpoint(options);

/**
 * Shorthand decorator for authenticated endpoints with automatic common error responses.
 * @template T - Type of the response data
 * @param {Object} options - Authenticated endpoint configuration options
 * @returns {MethodDecorator} Configured API endpoint decorator with authentication
 * @example
 * @ApiAuthEndpoint({
 *   summary: 'Get current user profile',
 *   auth: { type: AUTH_TYPE.JWT, required: true },
 *   responses: { [HttpStatus.OK]: { type: UserDto } }
 * })
 * getCurrentUser(@Request() req) {}
 */
export const ApiAuthEndpoint = <T>(
    options: Omit<ApiEndpointOptions<T>, 'auth'> & {
        auth: AuthConfig | AuthConfig[];
    },
) => ApiEndpoint({ ...options, includeCommonErrors: true });

/**
 * Shorthand decorator for endpoints with validation error documentation.
 * @template T - Type of the response data
 * @param {Object} options - Validation endpoint configuration options
 * @returns {MethodDecorator} Configured API endpoint decorator with validation error docs
 * @example
 * @ApiValidationEndpoint({
 *   summary: 'Create user with validation',
 *   responses: { [HttpStatus.CREATED]: { type: UserDto } },
 *   body: { type: CreateUserDto },
 *   validation: {
 *     errorExamples: [
 *       { field: 'email', constraint: 'isEmail', message: 'email must be an email' }
 *     ]
 *   }
 * })
 * createUser(@Body() dto: CreateUserDto) {}
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
