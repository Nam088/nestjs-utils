import type { ValidationError } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

import { map } from 'lodash';

import { ValidationException } from '../exeption';

/**
 * Custom exception factory for ValidationPipe
 * Transforms validation errors into our custom ValidationException
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
 * Default validation pipe configuration
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
 * Production validation pipe configuration (with sanitized error messages)
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
 * Validation pipe options interface
 */
export interface ValidationPipeOptions {
    customExceptionFactory?: (errors: ValidationError[]) => unknown;
    disableErrorMessages?: boolean;
    forbidNonWhitelisted?: boolean;
    forbidUnknownValues?: boolean;
    transform?: boolean;
    whitelist?: boolean;
}

/**
 * Setup validation pipe based on environment with custom options
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
