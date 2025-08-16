import { applyDecorators, Type, HttpStatus, SetMetadata } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOperation,
    ApiResponse,
    ApiUnauthorizedResponse,
    ApiBasicAuth,
    ApiCookieAuth,
    ApiOAuth2,
    ApiSecurity,
    ApiTags,
    ApiBody,
    ApiQuery,
    ApiParam,
    ApiParamOptions,
    ApiHeader,
    ApiConsumes,
    ApiProduces,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiInternalServerErrorResponse,
    ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

import { map, isEmpty, isArray, keyBy, mapValues, isNumber } from 'lodash';

import { AUTH_TYPE } from '../constants';
import { PaginationType, PAGINATION_TYPE } from '../constants/pagination.constants';
import { ApiResponseDto } from '../dto/api.response.dto';
import { ErrorResponseDto } from '../dto/error.response.dto';
import { ApiPaginatedResponseDto, ApiCursorPaginatedResponseDto } from '../dto/paginated.response.dto';

// --- Enhanced Types for configuration ---
/**
 * Individual authentication configurations
 */
interface JwtAuthConfig {
    type: typeof AUTH_TYPE.JWT;
    provider?: string; // Name of the JWT provider
    required?: boolean;
}

interface ApiKeyAuthConfig {
    type: typeof AUTH_TYPE.API_KEY;
    provider?: string; // Name of the API Key provider
    required?: boolean;
}

interface OAuth2AuthConfig {
    type: typeof AUTH_TYPE.OAUTH2;
    scopes?: string[];
    provider?: string; // Name of the OAuth2 provider
    required?: boolean;
}

interface BasicAuthConfig {
    type: typeof AUTH_TYPE.BASIC;
    required?: boolean;
}

interface CookieAuthConfig {
    type: typeof AUTH_TYPE.COOKIE;
    name?: string;
    required?: boolean;
}

/**
 * Union type for all auth configurations
 */
type AuthConfig = JwtAuthConfig | ApiKeyAuthConfig | OAuth2AuthConfig | BasicAuthConfig | CookieAuthConfig;

/**
 * Custom error response configuration
 */
interface CustomErrorConfig {
    status: HttpStatus;
    description?: string;
    type?: Type<any>;
    examples?: Record<string, any>;
}

/**
 * Request body configuration
 */
interface BodyConfig {
    type?: Type<any>;
    description?: string;
    required?: boolean;
    examples?: Record<string, any>;
    files?: { name: string; description?: string; required?: boolean; isArray?: boolean }[];
}

/**
 * Query parameter configuration
 */
interface QueryConfig {
    name: string;
    type?: 'string' | 'number' | 'boolean' | 'array';
    description?: string;
    required?: boolean;
    example?: any;
    enum?: any[];
}

/**
 * Path parameter configuration
 */
interface ParamConfig {
    name: string;
    type?: 'string' | 'number' | 'uuid';
    description?: string;
    example?: any;
    format?: string;
}

/**
 * Header configuration
 */
interface HeaderConfig {
    name: string;
    description?: string;
    required?: boolean;
    example?: string;
}

/**
 * Response configuration with multiple status codes
 */
interface ResponseConfig<T> {
    type: Type<T> | null;
    description?: string;
    examples?: Record<string, any>;
    headers?: Record<string, any>;
    isArray?: boolean;
}

/**
 * Validation error example configuration
 */
interface ValidationErrorExample {
    field: string;
    constraint: string;
    message: string;
}

/**
 * Enhanced options for configuring the ApiEndpoint decorator
 */
interface ApiEndpointOptions<T> {
    // Basic configuration
    summary: string;
    description?: string;
    tags?: string | string[];
    deprecated?: boolean;

    // Response configuration
    responses?: Partial<Record<HttpStatus, ResponseConfig<T>>>;
    paginationType?: PaginationType;

    // Authentication
    auth?: AuthConfig | AuthConfig[];

    // Request configuration
    body?: BodyConfig;
    queries?: QueryConfig[];
    params?: ParamConfig[];
    headers?: HeaderConfig[];

    // Content type configuration
    consumes?: string[];
    produces?: string[];

    // Error handling
    errors?: (HttpStatus | CustomErrorConfig)[];
    includeCommonErrors?: boolean; // Auto-include 400, 404, 500 etc.

    // Rate limiting
    rateLimit?: {
        limit: number;
        window: string;
        message?: string;
    };

    // Caching
    cache?: {
        ttl?: number;
        description?: string;
    };

    // Additional metadata
    operationId?: string;
    externalDocs?: {
        description: string;
        url: string;
    };

    // Validation
    validation?: {
        groups?: string[];
        errorExamples?: ValidationErrorExample[];
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

    authConfigs.forEach((config) => {
        switch (config.type) {
            case AUTH_TYPE.JWT: {
                const providerName = config.provider || 'bearer';
                decorators.push(ApiBearerAuth(providerName));
                break;
            }
            case AUTH_TYPE.API_KEY: {
                const apiKeyDecorators = createApiKeyDecorator(config);
                decorators.push(...apiKeyDecorators);
                break;
            }
            case AUTH_TYPE.OAUTH2: {
                const scopes = config.scopes || ['read', 'write'];
                const providerName = config.provider || 'oauth2';
                decorators.push(ApiOAuth2(scopes, providerName));
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
        description: 'Bad Request - Invalid input data',
        type: ErrorResponseDto,
        examples: {
            'Bad Request': {
                summary: 'Bad Request Example',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message: 'Invalid input data provided',
                    path: '/api/example',
                    timestamp: '2025-01-15T10:30:00.000Z',
                    requestId: 'abc123-def456-ghi789',
                },
            },
        },
    }),
    ApiNotFoundResponse({
        description: 'Resource not found',
        type: ErrorResponseDto,
        examples: {
            'Not Found': {
                summary: 'Not Found Example',
                value: {
                    statusCode: 404,
                    error: 'Not Found',
                    message: 'The requested resource was not found',
                    path: '/api/example',
                    timestamp: '2025-01-15T10:30:00.000Z',
                    requestId: 'abc123-def456-ghi789',
                },
            },
        },
    }),
    ApiConflictResponse({
        description: 'Conflict - Resource already exists or constraint violation',
        type: ErrorResponseDto,
        examples: {
            Conflict: {
                summary: 'Conflict Example',
                value: {
                    statusCode: 409,
                    error: 'Conflict',
                    message: 'Resource already exists or constraint violation',
                    path: '/api/example',
                    timestamp: '2025-01-15T10:30:00.000Z',
                    requestId: 'abc123-def456-ghi789',
                },
            },
        },
    }),
    ApiInternalServerErrorResponse({
        description: 'Internal Server Error',
        type: ErrorResponseDto,
        examples: {
            'Internal Server Error': {
                summary: 'Internal Server Error Example',
                value: {
                    statusCode: 500,
                    error: 'Internal Server Error',
                    message: 'An unexpected error occurred while processing your request',
                    path: '/api/example',
                    timestamp: '2025-01-15T10:30:00.000Z',
                    requestId: 'abc123-def456-ghi789',
                },
            },
        },
    }),
    ApiTooManyRequestsResponse({
        description: 'Too Many Requests - Rate limit exceeded',
        type: ErrorResponseDto,
        examples: {
            'Too Many Requests': {
                summary: 'Rate Limit Exceeded Example',
                value: {
                    statusCode: 429,
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded. Please try again later',
                    path: '/api/example',
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

    errorExamples.forEach(({ field, constraint, message }) => {
        if (!fieldErrors[field]) {
            fieldErrors[field] = {};
        }
        fieldErrors[field][constraint] = message;
        errors.push(message);
    });

    return {
        statusCode: 400,
        error: 'Validation failed',
        message: 'Validation failed',
        errors,
        fieldErrors,
        path: '/api/example',
        timestamp: '2025-01-15T10:30:00.000Z',
        requestId: 'abc123-def456-ghi789',
    };
};

/**
 * Create custom error decorators
 */
const createCustomErrorDecorators = (errors: (HttpStatus | CustomErrorConfig)[]): MethodDecorator[] =>
    map(errors, (error) => {
        if (isNumber(error)) {
            // Simple HttpStatus
            return ApiResponse({
                status: error,
                description: getHttpStatusDescription(error),
                type: ErrorResponseDto,
                examples: {
                    [getHttpStatusDescription(error)]: {
                        summary: `${getHttpStatusDescription(error)} Example`,
                        value: {
                            statusCode: error,
                            error: getHttpStatusDescription(error),
                            message: getDefaultErrorMessage(error),
                            path: '/api/example',
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
            description: error.description || getHttpStatusDescription(error.status),
            type: error.type || ErrorResponseDto,
            ...(error.examples && { examples: error.examples }),
        });
    });

/**
 * Get default description for HTTP status codes
 */
const getHttpStatusDescription = (status: HttpStatus): string => {
    const statusDescriptions: Partial<Record<HttpStatus, string>> = {
        [HttpStatus.BAD_REQUEST]: 'Bad Request',
        [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
        [HttpStatus.FORBIDDEN]: 'Forbidden',
        [HttpStatus.NOT_FOUND]: 'Not Found',
        [HttpStatus.CONFLICT]: 'Conflict',
        [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
        [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
        [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
        [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    };

    return statusDescriptions[status] || `HTTP ${status}`;
};

/**
 * Get default error message for HTTP status codes
 */
const getDefaultErrorMessage = (status: HttpStatus): string => {
    const errorMessages: Partial<Record<HttpStatus, string>> = {
        [HttpStatus.BAD_REQUEST]: 'Invalid input data provided',
        [HttpStatus.UNAUTHORIZED]: 'Invalid or missing authentication',
        [HttpStatus.FORBIDDEN]: 'Insufficient permissions',
        [HttpStatus.NOT_FOUND]: 'The requested resource was not found',
        [HttpStatus.CONFLICT]: 'Resource already exists or constraint violation',
        [HttpStatus.UNPROCESSABLE_ENTITY]: 'The request data is invalid',
        [HttpStatus.TOO_MANY_REQUESTS]: 'Rate limit exceeded. Please try again later',
        [HttpStatus.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred while processing your request',
        [HttpStatus.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable',
    };

    return errorMessages[status] || 'An error occurred';
};

/**
 * Normalize response configuration
 */
const normalizeResponseConfig = <T>(
    response: ResponseConfig<T> | Type<T> | null | undefined,
): ResponseConfig<T> | null => {
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
const getPaginatedType = <T>(pagination: PaginationType | undefined, type: Type<T>): any => {
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
        summary,
        description = '',
        tags,
        deprecated = false,
        responses,
        paginationType,
        auth,
        body,
        queries = [],
        params = [],
        headers = [],
        consumes,
        produces,
        errors = [],
        includeCommonErrors = false,
        rateLimit,
        cache,
        operationId,
        externalDocs,
        validation,
    } = options;

    const decorators: (MethodDecorator | ClassDecorator | PropertyDecorator)[] = [];

    // 1. Set Swagger Operation
    const operationOptions: Record<string, unknown> = { summary, description };
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
                    format: 'binary',
                    description: file.description,
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
        const schema: { type: 'string' | 'number'; format?: string; example?: string | number } = {
            type: (isUuid ? 'string' : (param.type ?? 'string')) as 'string' | 'number',
            ...(param.format || isUuid ? { format: param.format ?? 'uuid' } : {}),
            ...(param.example !== undefined ? { example: param.example as string | number } : {}),
        };

        const paramOptions: ApiParamOptions = {
            name: param.name,
            required: true,
            description: param.description,
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
                    description: 'Unauthorized - Invalid or missing authentication',
                    type: ErrorResponseDto,
                    examples: {
                        Unauthorized: {
                            summary: 'Unauthorized Example',
                            value: {
                                statusCode: 401,
                                error: 'Unauthorized',
                                message: 'Invalid or missing authentication',
                                path: '/api/example',
                                timestamp: '2025-01-15T10:30:00.000Z',
                                requestId: 'abc123-def456-ghi789',
                            },
                        },
                    },
                }),
            );
            decorators.push(
                ApiForbiddenResponse({
                    description: 'Forbidden - Insufficient permissions',
                    type: ErrorResponseDto,
                    examples: {
                        Forbidden: {
                            summary: 'Forbidden Example',
                            value: {
                                statusCode: 403,
                                error: 'Forbidden',
                                message: 'Insufficient permissions',
                                path: '/api/example',
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
            { field: 'email', constraint: 'isEmail', message: 'email must be an email' },
            {
                field: 'password',
                constraint: 'minLength',
                message: 'password must be longer than or equal to 8 characters',
            },
        ];

        const validationErrorExample = createValidationErrorExample(validationErrorExamples);

        decorators.push(
            ApiBadRequestResponse({
                description: 'Validation Error - Invalid input data',
                type: ErrorResponseDto,
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
                    description: rateLimit.message || 'Rate limit exceeded',
                    type: ErrorResponseDto,
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
    options: Omit<ApiEndpointOptions<T>, 'responses'> & { response?: ResponseConfig<T> | Type<T> | null },
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
    options: Omit<ApiEndpointOptions<T>, 'responses'> & { response?: ResponseConfig<T> | Type<T> | null },
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
    options: Omit<ApiEndpointOptions<T>, 'responses'> & { response?: ResponseConfig<T> | Type<T> | null },
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
    options: Omit<ApiEndpointOptions<T>, 'responses'> & { response?: ResponseConfig<T> | Type<T> | null },
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
            groups?: string[];
            errorExamples?: ValidationErrorExample[];
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
