import { ValidationPipe, ValidationError } from '@nestjs/common';

import { map } from 'lodash';

import { ValidationException } from '../exeption';

/**
 * Custom exception factory for ValidationPipe
 * Transforms validation errors into our custom ValidationException
 */
export const validationExceptionFactory = (errors: ValidationError[]) => {
    const customErrors = map(errors, (error) => ({
        property: String(error.property),
        constraints: error.constraints ? { ...error.constraints } : {},
        value: error.value as unknown,
    }));

    return new ValidationException(customErrors);
};

/**
 * Default validation pipe configuration
 */
export const validationPipeConfig = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    disableErrorMessages: false,
    exceptionFactory: validationExceptionFactory,
    validationError: {
        target: false,
        value: false,
    },
});

/**
 * Production validation pipe configuration (with sanitized error messages)
 */
export const productionValidationPipeConfig = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    disableErrorMessages: false,
    exceptionFactory: validationExceptionFactory,
    validationError: {
        target: false,
        value: false,
    },
});

/**
 * Validation pipe options interface
 */
export interface ValidationPipeOptions {
    isDevelopment?: boolean;
    transform?: boolean;
    whitelist?: boolean;
    forbidNonWhitelisted?: boolean;
    forbidUnknownValues?: boolean;
    disableErrorMessages?: boolean;
    customExceptionFactory?: (errors: ValidationError[]) => any;
}

/**
 * Setup validation pipe based on environment with custom options
 */
export const getValidationPipeConfig = (options: ValidationPipeOptions = {}) => {
    const {
        isDevelopment = process.env.NODE_ENV === 'development',
        transform = true,
        whitelist = true,
        forbidNonWhitelisted = true,
        forbidUnknownValues = true,
        disableErrorMessages = false,
        customExceptionFactory,
    } = options;

    const baseConfig = {
        isDevelopment,
        transform,
        whitelist,
        forbidNonWhitelisted,
        forbidUnknownValues,
        disableErrorMessages,
        exceptionFactory: customExceptionFactory || validationExceptionFactory,
        validationError: {
            target: false,
            value: false,
        },
    };

    return new ValidationPipe(baseConfig);
};
