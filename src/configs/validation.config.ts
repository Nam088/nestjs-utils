import type { ValidationError } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

import { map } from 'lodash';

import { ValidationException } from '../exeption';

/**
 * Custom exception factory for ValidationPipe.
 * Transforms validation errors into our custom ValidationException.
 * @param {ValidationError[]} errors - Array of validation errors from class-validator
 * @returns {ValidationException} Custom validation exception with formatted errors
 * @example
 * const factory = validationExceptionFactory(validationErrors);
 * throw factory; // throws ValidationException
 */
export const validationExceptionFactory = (errors: ValidationError[]) => {
    const customErrors = map(errors, (error) => ({
        constraints: error.constraints ? { ...error.constraints } : {},
        property: String(error.property),
        value: error.value as unknown,
    }));

    return new ValidationException(customErrors);
};

/**
 * Default validation pipe configuration for development environment.
 * Provides comprehensive validation with detailed error messages.
 */
export const validationPipeConfig = new ValidationPipe({
    disableErrorMessages: false,
    exceptionFactory: validationExceptionFactory,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transform: true,
    validationError: {
        target: false,
        value: false,
    },
    whitelist: true,
});

/**
 * Production validation pipe configuration with sanitized error messages.
 * Similar to default config but optimized for production use.
 */
export const productionValidationPipeConfig = new ValidationPipe({
    disableErrorMessages: false,
    exceptionFactory: validationExceptionFactory,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transform: true,
    validationError: {
        target: false,
        value: false,
    },
    whitelist: true,
});

/**
 * Validation pipe options interface for custom configuration.
 */
export interface ValidationPipeOptions {
    /** Custom exception factory function */
    customExceptionFactory?: (errors: ValidationError[]) => unknown;
    /** Whether to disable error messages */
    disableErrorMessages?: boolean;
    /** Whether to forbid non-whitelisted properties */
    forbidNonWhitelisted?: boolean;
    /** Whether to forbid unknown values */
    forbidUnknownValues?: boolean;
    /** Whether to enable automatic transformation */
    transform?: boolean;
    /** Whether to enable property whitelisting */
    whitelist?: boolean;
}

/**
 * Sets up validation pipe based on environment with custom options.
 * @param {ValidationPipeOptions} options - Custom validation pipe configuration options
 * @returns {ValidationPipe} Configured validation pipe instance
 * @example
 * const pipe = getValidationPipeConfig({
 *   disableErrorMessages: false,
 *   transform: true,
 *   whitelist: true
 * });
 */
export const getValidationPipeConfig = (options: ValidationPipeOptions = {}): ValidationPipe => {
    const {
        customExceptionFactory,
        disableErrorMessages = false,
        forbidNonWhitelisted = true,
        forbidUnknownValues = true,
        transform = true,
        whitelist = true,
    } = options;

    const baseConfig: ConstructorParameters<typeof ValidationPipe>[0] = {
        disableErrorMessages,
        exceptionFactory: customExceptionFactory || validationExceptionFactory,
        forbidNonWhitelisted,
        forbidUnknownValues,
        transform,
        validationError: {
            target: false,
            value: false,
        },
        whitelist,
    };

    return new ValidationPipe(baseConfig);
};
