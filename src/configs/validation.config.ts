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
