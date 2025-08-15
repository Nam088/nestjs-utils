import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { Request, Response } from 'express';
import { get, isArray, isObject, isString, size } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { ValidationException } from './validation.exception';
import { ErrorResponseDto } from '../dto/error.response.dto';

export interface HttpExceptionFilterOptions {
    isDevelopment: boolean;
    enableSanitization?: boolean;
    enableRateLimitTracking?: boolean;
    enableMetrics?: boolean;
    customErrorMessages?: Record<number, string>;
}

export interface ErrorMetrics {
    increment: (status: number, path: string, method: string) => void;
}

export interface RateLimitTracker {
    track: (ip: string, path: string) => void;
}

interface SanitizedError {
    message: string;
    stack?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);
    private readonly reflector: Reflector;
    private readonly isDevelopment: boolean;
    private readonly enableSanitization: boolean;
    private readonly enableRateLimitTracking: boolean;
    private readonly enableMetrics: boolean;
    private readonly customErrorMessages: Record<number, string>;
    private readonly errorMetrics?: ErrorMetrics;
    private readonly rateLimitTracker?: RateLimitTracker;

    // Sensitive information patterns to sanitize
    private readonly sensitivePatterns = [
        /password[s]?[:\s=]+[^\s]+/gi,
        /token[s]?[:\s=]+[^\s]+/gi,
        /key[s]?[:\s=]+[^\s]+/gi,
        /secret[s]?[:\s=]+[^\s]+/gi,
        /api[_-]?key[s]?[:\s=]+[^\s]+/gi,
        /authorization[:\s=]+[^\s]+/gi,
        /bearer\s+[^\s]+/gi,
        /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card numbers
        /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    ];

    constructor(
        reflector: Reflector,
        options?: HttpExceptionFilterOptions,
        errorMetrics?: ErrorMetrics,
        rateLimitTracker?: RateLimitTracker,
    ) {
        this.reflector = reflector;
        this.isDevelopment = options?.isDevelopment ?? false;
        this.enableSanitization = options?.enableSanitization ?? true;
        this.enableRateLimitTracking = options?.enableRateLimitTracking ?? false;
        this.enableMetrics = options?.enableMetrics ?? false;
        this.customErrorMessages = options?.customErrorMessages ?? {};
        this.errorMetrics = errorMetrics;
        this.rateLimitTracker = rateLimitTracker;
    }

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Early return if response already sent
        if (response.headersSent) {
            this.logger.warn('Cannot send error response - headers already sent');
            return;
        }

        try {
            const status = this.getHttpStatus(exception);
            const errorResponse = this.getErrorResponse(exception, status);
            const correlationId = this.getOrCreateCorrelationId(request, response);
            const clientIp = this.getClientIp(request);

            // Track rate limits if enabled
            if (this.enableRateLimitTracking && this.rateLimitTracker) {
                this.rateLimitTracker.track(clientIp, request.url);
            }

            // Record metrics if enabled
            if (this.enableMetrics && this.errorMetrics) {
                this.errorMetrics.increment(status, request.url, request.method);
            }

            const errorPayload = this.buildErrorPayload(status, errorResponse, request, correlationId, exception);

            // Add security headers
            this.setSecurityHeaders(response);

            // Log the error with appropriate level
            this.logError(exception, status, request, correlationId, clientIp);

            // Send response with timeout protection
            this.sendErrorResponse(response, status, errorPayload);
        } catch (filterError) {
            // Fallback error handling if the filter itself fails
            this.handleFilterError(filterError, response, request);
        }
    }

    private getHttpStatus(exception: unknown): number {
        if (exception instanceof HttpException) {
            return exception.getStatus();
        }

        // Handle specific error types
        if (exception instanceof Error) {
            switch (exception.name) {
                case 'ValidationError':
                    return HttpStatus.BAD_REQUEST;
                case 'UnauthorizedError':
                case 'JsonWebTokenError':
                case 'TokenExpiredError':
                    return HttpStatus.UNAUTHORIZED;
                case 'ForbiddenError':
                    return HttpStatus.FORBIDDEN;
                case 'NotFoundError':
                    return HttpStatus.NOT_FOUND;
                case 'ConflictError':
                    return HttpStatus.CONFLICT;
                case 'TimeoutError':
                    return HttpStatus.REQUEST_TIMEOUT;
                case 'PayloadTooLargeError':
                    return HttpStatus.PAYLOAD_TOO_LARGE;
                case 'TooManyRequestsError':
                    return HttpStatus.TOO_MANY_REQUESTS;
                default:
                    return HttpStatus.INTERNAL_SERVER_ERROR;
            }
        }

        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private getErrorResponse(
        exception: unknown,
        status: number,
    ):
        | string
        | {
              error: string;
              message: string | string[];
              details?: any;
          } {
        if (exception instanceof HttpException) {
            return exception.getResponse() as
                | string
                | {
                      error: string;
                      message: string | string[];
                      details?: any;
                  };
        }

        const { customErrorMessages } = this;
        const customMessage = customErrorMessages[status];
        if (customMessage) {
            return {
                error: this.getErrorNameByStatus(status),
                message: customMessage,
            };
        }

        return {
            error: this.getErrorNameByStatus(status),
            message: exception instanceof Error ? exception.message : 'An unexpected error occurred',
        };
    }

    private getErrorNameByStatus(status: number): string {
        const statusNames: Record<number, string> = {
            [HttpStatus.BAD_REQUEST]: 'Bad Request',
            [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
            [HttpStatus.FORBIDDEN]: 'Forbidden',
            [HttpStatus.NOT_FOUND]: 'Not Found',
            [HttpStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
            [HttpStatus.CONFLICT]: 'Conflict',
            [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
            [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
            [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
            [HttpStatus.BAD_GATEWAY]: 'Bad Gateway',
            [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
            [HttpStatus.GATEWAY_TIMEOUT]: 'Gateway Timeout',
        };

        return statusNames[status] || 'Unknown Error';
    }

    private getOrCreateCorrelationId(request: Request, response: Response): string {
        const existingId =
            (request.headers['x-correlation-id'] as string) ||
            (request.headers['x-request-id'] as string) ||
            (request.headers['x-trace-id'] as string);

        const correlationId = existingId || uuidv4();

        response.setHeader('x-correlation-id', correlationId);
        response.setHeader('x-request-id', correlationId);

        return correlationId;
    }

    private getClientIp(request: Request): string {
        return (
            (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
            (request.headers['x-real-ip'] as string) ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            'unknown'
        );
    }

    private buildErrorPayload(
        status: number,
        errorResponse:
            | string
            | {
                  error: string;
                  message: string | string[];
                  details?: any;
              },
        request: Request,
        correlationId: string,
        exception: unknown,
    ): ErrorResponseDto {
        // Handle ValidationException specifically
        if (exception instanceof ValidationException) {
            const { url } = request;
            const validationMessages = exception.getValidationMessages();
            const fieldErrors: Record<string, Record<string, string>> = exception.getFieldErrors();

            const basePayload: ErrorResponseDto = {
                statusCode: status,
                error: 'Validation failed',
                message: exception.getFirstValidationMessage(),
                errors: validationMessages,
                fieldErrors,
                path: url,
                timestamp: new Date().toISOString(),
                requestId: correlationId,
            };

            // Sanitize validation errors in production
            if (!this.isDevelopment && this.enableSanitization) {
                basePayload.message = this.sanitizeString(basePayload.message);
                if (basePayload.errors) {
                    basePayload.errors = basePayload.errors.map((error) => this.sanitizeString(error));
                }
                if (basePayload.fieldErrors) {
                    Object.keys(basePayload.fieldErrors).forEach((property) => {
                        const fieldErrors = basePayload.fieldErrors![property];
                        Object.keys(fieldErrors).forEach((constraint) => {
                            fieldErrors[constraint] = this.sanitizeString(fieldErrors[constraint]);
                        });
                    });
                }
            }

            return basePayload;
        }

        // Handle other error types
        let message: string;
        let errors: string[] | undefined;

        if (isString(errorResponse)) {
            message = errorResponse;
        } else if (isArray(errorResponse.message)) {
            const firstMessage = get(errorResponse, 'message[0]', 'Validation failed');
            const remainingMessages = get(errorResponse, 'message.slice(1)', []);
            message = firstMessage;
            errors = size(remainingMessages) > 0 ? remainingMessages : undefined;
        } else if (isString(errorResponse.message)) {
            const { message: errorMessage } = errorResponse;
            message = errorMessage;
        } else {
            const { message: errorMessage } = errorResponse;
            message = String(errorMessage || 'An error occurred');
        }

        const { url } = request;
        const basePayload: ErrorResponseDto = {
            statusCode: status,
            error: isString(errorResponse) ? errorResponse : errorResponse.error,
            message,
            errors,
            path: url,
            timestamp: new Date().toISOString(),
            requestId: correlationId,
        };

        // Add additional details in development mode
        if (this.isDevelopment) {
            if (exception instanceof Error && exception.stack) {
                basePayload.stack = this.enableSanitization
                    ? this.sanitizeError({ message: exception.message, stack: exception.stack }).stack
                    : exception.stack;
            }

            if (isObject(errorResponse) && 'details' in errorResponse && errorResponse.details) {
                basePayload.details = errorResponse.details as Record<string, unknown>;
            }

            const { method, headers } = request;
            basePayload.method = method;
            basePayload.userAgent = headers['user-agent'];
        }

        // Sanitize error messages in production
        if (!this.isDevelopment && this.enableSanitization) {
            // Sanitize main message
            const sanitized = this.sanitizeError({
                message: basePayload.message,
                stack: basePayload.stack,
            });
            basePayload.message = sanitized.message;
            if (basePayload.stack) {
                basePayload.stack = sanitized.stack;
            }

            // Sanitize validation errors if present
            if (basePayload.errors && isArray(basePayload.errors)) {
                basePayload.errors = basePayload.errors.map((error) => this.sanitizeString(error));
            }
        }

        return basePayload;
    }

    private sanitizeError(error: SanitizedError): SanitizedError {
        const sanitizedMessage = this.sanitizeString(error.message);
        const sanitizedStack = this.sanitizeString(error.stack || '');

        return {
            message: sanitizedMessage,
            stack: sanitizedStack,
        };
    }

    private sanitizeString(input: string): string {
        if (!isString(input)) {
            return String(input || '');
        }

        let sanitized = input;
        this.sensitivePatterns.forEach((pattern) => {
            sanitized = sanitized.replace(pattern, '[REDACTED]');
        });

        return sanitized;
    }

    private setSecurityHeaders(response: Response): void {
        // Prevent information leakage
        response.removeHeader('X-Powered-By');
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.setHeader('X-Frame-Options', 'DENY');
        response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.setHeader('Pragma', 'no-cache');
        response.setHeader('Expires', '0');
    }

    private logError(
        exception: unknown,
        status: number,
        request: Request,
        correlationId: string,
        clientIp: string,
    ): void {
        const { method, url, headers } = request;
        const logContext = {
            correlationId,
            status,
            method,
            url,
            clientIp,
            userAgent: headers['user-agent'],
            timestamp: new Date().toISOString(),
        };

        if (exception instanceof HttpException) {
            // Client errors (4xx) - log as warning
            if (status >= 400 && status < 500) {
                this.logger.warn(
                    `[${correlationId}] Client Error: ${status} ${request.method} ${request.url} - ${exception.message}`,
                    logContext,
                );
            } else {
                // Server errors (5xx) - log as error
                this.logger.error(
                    `[${correlationId}] Server Error: ${status} ${request.method} ${request.url} - ${exception.message}`,
                    exception.stack,
                    logContext,
                );
            }
        } else {
            const errorMessage = exception instanceof Error ? exception.message : JSON.stringify(exception);

            const errorStack = exception instanceof Error ? exception.stack : JSON.stringify(exception);

            this.logger.error(
                `[${correlationId}] Unhandled Exception: ${status} ${request.method} ${request.url} - ${errorMessage}`,
                errorStack,
                logContext,
            );
        }
    }

    private sendErrorResponse(response: Response, status: number, errorPayload: ErrorResponseDto): void {
        // Set a reasonable timeout for error responses
        const timeout = setTimeout(() => {
            if (!response.headersSent) {
                this.logger.error('Error response timed out');
                response.end();
            }
        }, 5000);

        try {
            response.status(status).json(errorPayload);
            clearTimeout(timeout);
        } catch (error) {
            clearTimeout(timeout);
            this.logger.error('Failed to send error response', error);
        }
    }

    private handleFilterError(filterError: unknown, response: Response, request: Request): void {
        this.logger.error('Exception filter itself failed', filterError);

        // Send minimal error response to prevent hanging
        try {
            if (!response.headersSent) {
                const fallbackError: ErrorResponseDto = {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'Internal Server Error',
                    message: 'An unexpected error occurred while processing the request',
                    path: request.url,
                    timestamp: new Date().toISOString(),
                    requestId: uuidv4(),
                };

                response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(fallbackError);
            }
        } catch (finalError) {
            this.logger.error('Failed to send fallback error response', finalError);
            // Last resort - just end the response
            if (!response.headersSent) {
                response.status(500).end('Internal Server Error');
            }
        }
    }
}
