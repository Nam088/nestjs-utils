import { BadRequestException } from '@nestjs/common';

/**
 * Interface representing a single validation error item.
 */
export interface ValidationErrorItem {
    /** Validation constraints that failed */
    constraints: Record<string, string>;
    /** Property name that failed validation */
    property: string;
    /** The value that failed validation */
    value?: unknown;
}

/**
 * Custom exception class for handling validation errors with enhanced functionality.
 * Extends BadRequestException to provide structured validation error information.
 */
export class ValidationException extends BadRequestException {
    /** Array of validation errors that occurred */
    public readonly validationErrors: ValidationErrorItem[];

    /**
     * Creates a new ValidationException.
     * @param {ValidationErrorItem[]} validationErrors - Array of validation errors
     * @example
     * const errors = [
     *   { property: 'email', constraints: { isEmail: 'must be an email' } }
     * ];
     * throw new ValidationException(errors);
     */
    constructor(validationErrors: ValidationErrorItem[]) {
        super('Validation failed');
        this.validationErrors = validationErrors;
    }

    /**
     * Get all validation error messages as a flat array.
     * @returns {string[]} Array of error messages
     * @example
     * const exception = new ValidationException(errors);
     * const messages = exception.getValidationMessages();
     * // ['must be an email', 'is required']
     */
    getValidationMessages(): string[] {
        return this.validationErrors.flatMap((error) => Object.values(error.constraints || {}));
    }

    /**
     * Get validation errors with original constraints format.
     * @returns {Record<string, Record<string, string>>} Field errors grouped by property
     * @example
     * const exception = new ValidationException(errors);
     * const fieldErrors = exception.getFieldErrors();
     * // { email: { isEmail: 'must be an email' } }
     */
    getFieldErrors(): Record<string, Record<string, string>> {
        const result: Record<string, Record<string, string>> = {};

        this.validationErrors.forEach((error) => {
            if (error.constraints) {
                result[error.property] = { ...error.constraints };
            }
        });

        return result;
    }

    /**
     * Get validation errors with original constraints format.
     * @deprecated Use getFieldErrors() instead
     * @returns {Record<string, Record<string, string>>} Field errors grouped by property
     */
    getValidationErrorsByProperty(): Record<string, Record<string, string>> {
        return this.getFieldErrors();
    }
}
