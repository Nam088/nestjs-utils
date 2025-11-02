/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-lines-per-function */
import type { ZodType } from 'zod';
import { z } from 'zod';

import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

import { ZodBody, ZodParam, ZodQuery } from './zod-validation.decorator';

// Mock ZodValidationPipe
jest.mock('../pipes/zod-validation.pipe', () => ({
    ZodValidationPipe: jest.fn().mockImplementation((schema) => ({
        schema,
        transform: jest.fn(),
    })),
}));

describe('ZodValidationDecorators', () => {
    let mockSchema: ZodType;

    beforeEach(() => {
        mockSchema = z.object({
            name: z.string(),
            age: z.number(),
        });
        jest.clearAllMocks();
    });

    describe('ZodBody', () => {
        it('should return Body decorator with ZodValidationPipe', () => {
            const result = ZodBody(mockSchema);

            expect(ZodValidationPipe).toHaveBeenCalledWith(mockSchema);
            expect(result).toBeDefined();
        });

        it('should work with different schema types', () => {
            const stringSchema = z.string();
            const arraySchema = z.array(z.string());
            const unionSchema = z.union([z.string(), z.number()]);

            expect(() => ZodBody(stringSchema)).not.toThrow();
            expect(() => ZodBody(arraySchema)).not.toThrow();
            expect(() => ZodBody(unionSchema)).not.toThrow();
        });

        it('should handle complex nested schemas', () => {
            const complexSchema = z.object({
                tags: z.array(z.string()),
                user: z.object({
                    name: z.string(),
                    profile: z.object({
                        email: z.string().email(),
                        age: z.number(),
                    }),
                }),
            });

            expect(() => ZodBody(complexSchema)).not.toThrow();
        });
    });

    describe('ZodParam', () => {
        it('should return Param decorator with ZodValidationPipe', () => {
            const result = ZodParam(mockSchema);

            expect(ZodValidationPipe).toHaveBeenCalledWith(mockSchema);
            expect(result).toBeDefined();
        });

        it('should work with param-specific schemas', () => {
            const idSchema = z.object({
                id: z.string().uuid(),
            });

            expect(() => ZodParam(idSchema)).not.toThrow();
        });

        it('should handle primitive schemas for single params', () => {
            const stringSchema = z.string();
            const numberSchema = z.number();

            expect(() => ZodParam(stringSchema)).not.toThrow();
            expect(() => ZodParam(numberSchema)).not.toThrow();
        });
    });

    describe('ZodQuery', () => {
        it('should return Query decorator with ZodValidationPipe', () => {
            const result = ZodQuery(mockSchema);

            expect(ZodValidationPipe).toHaveBeenCalledWith(mockSchema);
            expect(result).toBeDefined();
        });

        it('should work with query-specific schemas', () => {
            const querySchema = z.object({
                limit: z.number().min(1).max(100).optional(),
                page: z.number().min(1).optional(),
                search: z.string().optional(),
            });

            expect(() => ZodQuery(querySchema)).not.toThrow();
        });

        it('should handle optional query parameters', () => {
            const optionalSchema = z.object({
                filter: z.string().optional(),
                sort: z.enum(['asc', 'desc']).optional(),
            });

            expect(() => ZodQuery(optionalSchema)).not.toThrow();
        });
    });

    describe('Integration scenarios', () => {
        it('should work with real-world schemas', () => {
            const userCreateSchema = z.object({
                name: z.string().min(2).max(50),
                email: z.string().email(),
                address: z
                    .object({
                        city: z.string(),
                        street: z.string(),
                        zipCode: z.string().regex(/^\d{5}$/),
                    })
                    .optional(),
                age: z.number().int().min(18).max(120),
            });

            const idParamSchema = z.object({
                id: z.string().uuid(),
            });

            const querySchema = z.object({
                limit: z.number().min(1).max(100).default(10),
                page: z.number().min(1).default(1),
                search: z.string().optional(),
                sortBy: z.enum(['name', 'email', 'age']).default('name'),
                sortOrder: z.enum(['asc', 'desc']).default('asc'),
            });

            expect(() => ZodBody(userCreateSchema)).not.toThrow();
            expect(() => ZodParam(idParamSchema)).not.toThrow();
            expect(() => ZodQuery(querySchema)).not.toThrow();
        });

        it('should handle validation with custom error messages', () => {
            const schemaWithCustomErrors = z.object({
                name: z.string({
                    message: 'Name is required',
                }),
                age: z.number({
                    message: 'Age is required',
                }),
            });

            expect(() => ZodBody(schemaWithCustomErrors)).not.toThrow();
        });

        it('should work with discriminated unions', () => {
            const discriminatedSchema = z.discriminatedUnion('type', [
                z.object({
                    name: z.string(),
                    email: z.string().email(),
                    type: z.literal('user'),
                }),
                z.object({
                    name: z.string(),
                    type: z.literal('admin'),
                    permissions: z.array(z.string()),
                }),
            ]);

            expect(() => ZodBody(discriminatedSchema)).not.toThrow();
        });
    });

    describe('Edge cases', () => {
        it('should handle empty object schemas', () => {
            const emptySchema = z.object({});

            expect(() => ZodBody(emptySchema)).not.toThrow();
            expect(() => ZodParam(emptySchema)).not.toThrow();
            expect(() => ZodQuery(emptySchema)).not.toThrow();
        });

        it('should handle schemas with default values', () => {
            const schemaWithDefaults = z.object({
                name: z.string().default('Unknown'),
                isActive: z.boolean().default(true),
                age: z.number().default(0),
            });

            expect(() => ZodBody(schemaWithDefaults)).not.toThrow();
        });

        it('should handle schemas with transformations', () => {
            const transformSchema = z.object({
                name: z.string().transform((val) => val.trim().toLowerCase()),
                age: z.string().transform((val) => parseInt(val, 10)),
            });

            expect(() => ZodBody(transformSchema)).not.toThrow();
        });
    });
});
