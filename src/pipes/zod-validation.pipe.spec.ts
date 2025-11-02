/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-lines-per-function */
import type { ArgumentMetadata } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

import { z } from 'zod';

import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
    let pipe: ZodValidationPipe;
    let mockMetadata: ArgumentMetadata;

    beforeEach(() => {
        mockMetadata = {
            type: 'body',
            data: undefined,
            metatype: Object,
        };
    });

    describe('constructor', () => {
        it('should create an instance with a schema', () => {
            const schema = z.object({
                name: z.string(),
                age: z.number(),
            });

            pipe = new ZodValidationPipe(schema);

            expect(pipe).toBeInstanceOf(ZodValidationPipe);
        });
    });

    describe('transform', () => {
        beforeEach(() => {
            const schema = z.object({
                name: z.string().min(1),
                email: z.string().email().optional(),
                age: z.number().min(0),
            });

            pipe = new ZodValidationPipe(schema);
        });

        describe('valid data', () => {
            it('should return parsed data for valid input', () => {
                const validData = {
                    name: 'John Doe',
                    email: 'john@example.com',
                    age: 25,
                };

                const result = pipe.transform(validData, mockMetadata);

                expect(result).toEqual(validData);
            });

            it('should return parsed data for valid input without optional fields', () => {
                const validData = {
                    name: 'Jane Doe',
                    age: 30,
                };

                const result = pipe.transform(validData, mockMetadata);

                expect(result).toEqual(validData);
            });

            it('should handle primitive values when schema allows', () => {
                const stringSchema = z.string();
                const stringPipe = new ZodValidationPipe(stringSchema);

                const result = stringPipe.transform('hello world', mockMetadata);

                expect(result).toBe('hello world');
            });

            it('should handle arrays when schema allows', () => {
                const arraySchema = z.array(z.string());
                const arrayPipe = new ZodValidationPipe(arraySchema);

                const validArray = ['item1', 'item2', 'item3'];
                const result = arrayPipe.transform(validArray, mockMetadata);

                expect(result).toEqual(validArray);
            });
        });

        describe('invalid data', () => {
            it('should throw BadRequestException for invalid object structure', () => {
                const invalidData = {
                    name: 123, // should be string
                    age: 'not a number', // should be number
                };

                expect(() => pipe.transform(invalidData, mockMetadata)).toThrow(BadRequestException);

                try {
                    pipe.transform(invalidData, mockMetadata);
                } catch (error) {
                    expect(error).toBeInstanceOf(BadRequestException);
                    expect((error as BadRequestException).getResponse()).toEqual({
                        errors: expect.arrayContaining([
                            expect.objectContaining({
                                code: 'invalid_type',
                                path: ['name'],
                            }),
                            expect.objectContaining({
                                code: 'invalid_type',
                                path: ['age'],
                            }),
                        ]),
                        message: 'Validation failed',
                    });
                }
            });

            it('should throw BadRequestException for missing required fields', () => {
                const incompleteData = {
                    name: 'John Doe',
                    // age is missing
                };

                expect(() => pipe.transform(incompleteData, mockMetadata)).toThrow(BadRequestException);

                try {
                    pipe.transform(incompleteData, mockMetadata);
                } catch (error) {
                    expect(error).toBeInstanceOf(BadRequestException);
                    expect((error as BadRequestException).getResponse()).toEqual({
                        errors: expect.arrayContaining([
                            expect.objectContaining({
                                code: 'invalid_type',
                                path: ['age'],
                            }),
                        ]),
                        message: 'Validation failed',
                    });
                }
            });

            it('should throw BadRequestException for validation rule violations', () => {
                const invalidData = {
                    name: '', // empty string violates min(1)
                    email: 'invalid-email', // invalid email format
                    age: -5, // negative number violates min(0)
                };

                expect(() => pipe.transform(invalidData, mockMetadata)).toThrow(BadRequestException);

                try {
                    pipe.transform(invalidData, mockMetadata);
                } catch (error) {
                    expect(error).toBeInstanceOf(BadRequestException);
                    const response = (error as BadRequestException).getResponse() as any;

                    // Basic structure validation
                    expect(response.message).toBe('Validation failed');
                    expect(response.errors).toHaveLength(3);
                    expect(Array.isArray(response.errors)).toBe(true);

                    // Check that all errors have required properties
                    response.errors.forEach((err: any) => {
                        expect(err).toHaveProperty('code');
                        expect(err).toHaveProperty('path');
                        expect(err).toHaveProperty('message');
                        expect(Array.isArray(err.path)).toBe(true);
                    });

                    // Check that we have errors for all three fields

                    const paths = response.errors.map((err: any) => err.path[0]);

                    expect(paths).toContain('name');
                    expect(paths).toContain('age');
                    expect(paths).toContain('email');

                    // Check error codes are appropriate
                    const errorCodes = response.errors.map((err: any) => err.code);

                    expect(errorCodes).toContain('too_small'); // for name and age
                    expect(errorCodes).toContain('invalid_format'); // for email
                }
            });

            it('should throw BadRequestException for wrong data types', () => {
                const wrongTypeData = {
                    name: ['John', 'Doe'], // should be string, not array
                    age: { value: 25 }, // should be number, not object
                };

                expect(() => pipe.transform(wrongTypeData, mockMetadata)).toThrow(BadRequestException);
            });
        });

        describe('null and undefined values', () => {
            it('should throw BadRequestException for null value', () => {
                expect(() => pipe.transform(null, mockMetadata)).toThrow(BadRequestException);

                try {
                    pipe.transform(null, mockMetadata);
                } catch (error) {
                    expect(error).toBeInstanceOf(BadRequestException);
                    expect((error as BadRequestException).getResponse()).toEqual({
                        errors: [
                            {
                                code: 'invalid_type',
                                expected: 'object',
                                message: 'Request body is required',
                                path: [],
                                received: 'null',
                            },
                        ],
                        message: 'Validation failed',
                    });
                }
            });

            it('should throw BadRequestException for undefined value', () => {
                expect(() => pipe.transform(undefined, mockMetadata)).toThrow(BadRequestException);

                try {
                    pipe.transform(undefined, mockMetadata);
                } catch (error) {
                    expect(error).toBeInstanceOf(BadRequestException);
                    expect((error as BadRequestException).getResponse()).toEqual({
                        errors: [
                            {
                                code: 'invalid_type',
                                expected: 'object',
                                message: 'Request body is required',
                                path: [],
                                received: 'undefined',
                            },
                        ],
                        message: 'Validation failed',
                    });
                }
            });
        });

        describe('non-ZodError exceptions', () => {
            it('should re-throw non-ZodError exceptions', () => {
                const customError = new Error('Custom error');

                // Mock the schema.parse to throw a non-ZodError
                const mockSchema = {
                    parse: jest.fn().mockImplementation(() => {
                        throw customError;
                    }),
                } as any;

                const customPipe = new ZodValidationPipe(mockSchema);

                expect(() => customPipe.transform({}, mockMetadata)).toThrow('Custom error');
            });
        });

        describe('edge cases', () => {
            it('should handle empty object when schema allows', () => {
                const emptyObjectSchema = z.object({});
                const emptyPipe = new ZodValidationPipe(emptyObjectSchema);

                const result = emptyPipe.transform({}, mockMetadata);

                expect(result).toEqual({});
            });

            it('should handle nested object validation', () => {
                const nestedSchema = z.object({
                    user: z.object({
                        name: z.string(),
                        profile: z.object({
                            age: z.number(),
                        }),
                    }),
                });

                const nestedPipe = new ZodValidationPipe(nestedSchema);

                const validNestedData = {
                    user: {
                        name: 'John',
                        profile: {
                            age: 25,
                        },
                    },
                };

                const result = nestedPipe.transform(validNestedData, mockMetadata);

                expect(result).toEqual(validNestedData);
            });

            it('should handle union types', () => {
                const unionSchema = z.union([z.string(), z.number()]);
                const unionPipe = new ZodValidationPipe(unionSchema);

                // Test with string
                expect(unionPipe.transform('hello', mockMetadata)).toBe('hello');

                // Test with number
                expect(unionPipe.transform(42, mockMetadata)).toBe(42);

                // Test with invalid type
                expect(() => unionPipe.transform(true, mockMetadata)).toThrow(BadRequestException);
            });

            it('should handle enum validation', () => {
                const enumSchema = z.enum(['red', 'green', 'blue']);
                const enumPipe = new ZodValidationPipe(enumSchema);

                expect(enumPipe.transform('red', mockMetadata)).toBe('red');
                expect(enumPipe.transform('green', mockMetadata)).toBe('green');
                expect(enumPipe.transform('blue', mockMetadata)).toBe('blue');

                expect(() => enumPipe.transform('yellow', mockMetadata)).toThrow(BadRequestException);
            });
        });

        describe('metadata parameter', () => {
            it('should work with different metadata types', () => {
                const validData = { name: 'John', age: 25 };
                const schema = z.object({ name: z.string(), age: z.number() });
                const testPipe = new ZodValidationPipe(schema);

                const bodyMetadata: ArgumentMetadata = { type: 'body', data: undefined, metatype: Object };
                const queryMetadata: ArgumentMetadata = { type: 'query', data: undefined, metatype: Object };
                const paramMetadata: ArgumentMetadata = { type: 'param', data: undefined, metatype: Object };

                expect(testPipe.transform(validData, bodyMetadata)).toEqual(validData);
                expect(testPipe.transform(validData, queryMetadata)).toEqual(validData);
                expect(testPipe.transform(validData, paramMetadata)).toEqual(validData);
            });
        });
    });

    describe('integration scenarios', () => {
        it('should handle complex real-world schema', () => {
            const userSchema = z.object({
                id: z.string().uuid().optional(),
                name: z.string().min(2).max(50),
                email: z.string().email(),
                isActive: z.boolean().default(true),
                address: z
                    .object({
                        city: z.string().min(1),
                        street: z.string().min(1),
                        zipCode: z.string().regex(/^\d{5}$/),
                    })
                    .optional(),
                age: z.number().int().min(18).max(120),
                tags: z.array(z.string()).max(10).optional(),
            });

            const complexPipe = new ZodValidationPipe(userSchema);

            const validUserData = {
                name: 'John Doe',
                email: 'john@example.com',
                isActive: true,
                address: {
                    city: 'New York',
                    street: '123 Main St',
                    zipCode: '12345',
                },
                age: 25,
                tags: ['developer', 'typescript'],
            };

            const result = complexPipe.transform(validUserData, mockMetadata);

            expect(result).toEqual(validUserData);
        });

        it('should handle date validation', () => {
            const dateSchema = z.object({
                createdAt: z.string().datetime(),
                updatedAt: z.string().datetime().optional(),
            });

            const datePipe = new ZodValidationPipe(dateSchema);

            const validDateData = {
                createdAt: '2023-12-01T10:00:00Z',
                updatedAt: '2023-12-01T11:00:00Z',
            };

            const result = datePipe.transform(validDateData, mockMetadata);

            expect(result).toEqual(validDateData);
        });
    });
});
