import { BadRequestException } from '@nestjs/common';

export interface ValidationErrorItem {
    constraints: Record<string, string>;
    property: string;
    value?: unknown;
}

export class ValidationException extends BadRequestException {
    public readonly validationErrors: ValidationErrorItem[];

    constructor(validationErrors: ValidationErrorItem[]) {
        super('Validation failed');
        this.validationErrors = validationErrors;
    }

    /**
     * Get all validation error messages as a flat array
     */
    getValidationMessages(): string[] {
        return this.validationErrors.flatMap((error) => Object.values(error.constraints || {}));
    }

    /**
     * Get validation errors with original constraints format
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
     * @deprecated Use getFieldErrors() instead
     */
    getValidationErrorsByProperty(): Record<string, Record<string, string>> {
        return this.getFieldErrors();
    }
}
