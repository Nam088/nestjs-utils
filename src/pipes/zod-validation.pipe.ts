import type { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

import type { ZodType } from 'zod';
import { ZodError } from 'zod';

/**
 * Custom pipe for validating request data using Zod schemas
 * @example
 * ```typescript
 * @Post()
 * async create(@Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto) {
 *   return this.service.create(dto);
 * }
 * ```
 */
export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodType) {}

    transform(value: unknown, _metadata: ArgumentMetadata) {
        // Handle undefined or null values
        if (value === undefined || value === null) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: [
                    {
                        code: 'invalid_type',
                        expected: 'object',
                        message: 'Request body is required',
                        path: [],
                        received: value === null ? 'null' : 'undefined',
                    },
                ],
            });
        }

        try {
            return this.schema.parse(value);
        } catch (error) {
            if (error instanceof ZodError) {
                throw new BadRequestException({
                    message: 'Validation failed',
                    errors: error.issues,
                });
            }

            throw error;
        }
    }
}
