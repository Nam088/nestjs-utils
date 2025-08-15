import { BadRequestException } from '@nestjs/common';

import { get } from 'lodash';

export interface ValidationErrorItem {
    property: string;
    constraints: Record<string, string>;
    value?: any;
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
     * Get validation errors grouped by field name
     */
    getFieldErrors(): Record<string, string[]> {
        const result: Record<string, string[]> = {};

        this.validationErrors.forEach((error) => {
            if (error.constraints) {
                result[error.property] = Object.values(error.constraints);
            }
        });

        return result;
    }

    /**
     * @deprecated Use getFieldErrors() instead
     */
    getValidationErrorsByProperty(): Record<string, string[]> {
        return this.getFieldErrors();
    }

    /**
     * Get first validation error message
     */
    getFirstValidationMessage(): string {
        const messages = this.getValidationMessages();
        return get(messages, '0', 'Validation failed');
    }
}
