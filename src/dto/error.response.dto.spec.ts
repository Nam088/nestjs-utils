/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ErrorResponseDto } from './error.response.dto';

describe('ErrorResponseDto', () => {
    describe('Class Structure', () => {
        it('should be defined', () => {
            expect(ErrorResponseDto).toBeDefined();
        });

        it('should create an instance', () => {
            const dto = new ErrorResponseDto();

            expect(dto).toBeInstanceOf(ErrorResponseDto);
        });

        it('should have all required properties defined', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Bad Request';
            dto.message = 'Validation failed';
            dto.path = '/api/users';
            dto.statusCode = 400;
            dto.timestamp = '2024-01-01T00:00:00.000Z';
            dto.requestId = 'test-request-id';

            expect(dto.error).toBe('Bad Request');
            expect(dto.message).toBe('Validation failed');
            expect(dto.path).toBe('/api/users');
            expect(dto.statusCode).toBe(400);
            expect(dto.timestamp).toBe('2024-01-01T00:00:00.000Z');
            expect(dto.requestId).toBe('test-request-id');
        });

        it('should have all optional properties defined', () => {
            const dto = new ErrorResponseDto();

            dto.details = { key: 'value' };
            dto.errors = ['Error 1', 'Error 2'];
            dto.fieldErrors = { name: { isNotEmpty: 'name should not be empty' } };
            dto.method = 'POST';
            dto.stack = 'Error: Test\n  at test.js:1:1';
            dto.userAgent = 'Mozilla/5.0';

            expect(dto.details).toEqual({ key: 'value' });
            expect(dto.errors).toEqual(['Error 1', 'Error 2']);
            expect(dto.fieldErrors).toEqual({ name: { isNotEmpty: 'name should not be empty' } });
            expect(dto.method).toBe('POST');
            expect(dto.stack).toBe('Error: Test\n  at test.js:1:1');
            expect(dto.userAgent).toBe('Mozilla/5.0');
        });
    });

    describe('Error Response Scenarios', () => {
        it('should represent a basic error response', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Internal Server Error';
            dto.message = 'An unexpected error occurred';
            dto.path = '/api/data';
            dto.statusCode = 500;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-123';

            expect(dto.statusCode).toBe(500);
            expect(dto.error).toBe('Internal Server Error');
            expect(dto.message).toBe('An unexpected error occurred');
            expect(dto.path).toBe('/api/data');
            expect(dto.requestId).toBe('req-123');
        });

        it('should represent a validation error with errors array', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Bad Request';
            dto.message = 'Validation failed';
            dto.path = '/api/users';
            dto.statusCode = 400;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-456';
            dto.errors = ['Email is required', 'Password must be at least 8 characters'];

            expect(dto.statusCode).toBe(400);
            expect(dto.errors).toHaveLength(2);
            expect(dto.errors).toContain('Email is required');
            expect(dto.errors).toContain('Password must be at least 8 characters');
        });

        it('should represent a validation error with fieldErrors', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Bad Request';
            dto.message = 'Validation failed';
            dto.path = '/api/users';
            dto.statusCode = 400;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-789';
            dto.fieldErrors = {
                name: {
                    isNotEmpty: 'name should not be empty',
                },
                email: {
                    isEmail: 'email must be an email',
                },
            };

            expect(dto.fieldErrors).toHaveProperty('email');
            expect(dto.fieldErrors).toHaveProperty('name');
            expect(dto.fieldErrors?.email).toEqual({ isEmail: 'email must be an email' });
            expect(dto.fieldErrors?.name).toEqual({ isNotEmpty: 'name should not be empty' });
        });

        it('should represent a development error with stack trace', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Internal Server Error';
            dto.message = 'Database connection failed';
            dto.path = '/api/data';
            dto.statusCode = 500;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-dev-001';
            dto.stack = 'Error: Database connection failed\n  at Database.connect (db.ts:10:5)';
            dto.method = 'GET';
            dto.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
            dto.details = { connectionString: 'localhost:5432', timeout: 5000 };

            expect(dto.stack).toBeDefined();
            expect(dto.stack).toContain('Database connection failed');
            expect(dto.method).toBe('GET');
            expect(dto.userAgent).toContain('Mozilla/5.0');
            expect(dto.details).toHaveProperty('connectionString');
            expect(dto.details).toHaveProperty('timeout');
        });

        it('should represent a 404 Not Found error', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Not Found';
            dto.message = 'Resource not found';
            dto.path = '/api/users/999';
            dto.statusCode = 404;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-404';

            expect(dto.statusCode).toBe(404);
            expect(dto.error).toBe('Not Found');
            expect(dto.message).toBe('Resource not found');
        });

        it('should represent a 401 Unauthorized error', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Unauthorized';
            dto.message = 'Invalid credentials';
            dto.path = '/api/auth/login';
            dto.statusCode = 401;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-401';

            expect(dto.statusCode).toBe(401);
            expect(dto.error).toBe('Unauthorized');
            expect(dto.message).toBe('Invalid credentials');
        });

        it('should represent a 403 Forbidden error', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Forbidden';
            dto.message = 'Access denied';
            dto.path = '/api/admin/users';
            dto.statusCode = 403;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-403';

            expect(dto.statusCode).toBe(403);
            expect(dto.error).toBe('Forbidden');
            expect(dto.message).toBe('Access denied');
        });

        it('should represent a 429 Too Many Requests error', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Too Many Requests';
            dto.message = 'Rate limit exceeded';
            dto.path = '/api/data';
            dto.statusCode = 429;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-429';
            dto.details = { retryAfter: 60 };

            expect(dto.statusCode).toBe(429);
            expect(dto.error).toBe('Too Many Requests');
            expect(dto.details?.retryAfter).toBe(60);
        });
    });

    describe('Property Types', () => {
        it('should handle complex details object', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Bad Request';
            dto.message = 'Invalid request';
            dto.path = '/api/test';
            dto.statusCode = 400;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-complex';
            dto.details = {
                array: [1, 2, 3],
                boolean: true,
                nested: {
                    deep: {
                        value: 'test',
                    },
                },
                number: 42,
            };

            expect(dto.details).toHaveProperty('nested');
            expect(dto.details).toHaveProperty('array');
            expect(dto.details).toHaveProperty('boolean');
            expect(dto.details).toHaveProperty('number');
            expect((dto.details as any).nested.deep.value).toBe('test');
            expect((dto.details as any).array).toEqual([1, 2, 3]);
            expect((dto.details as any).boolean).toBe(true);
            expect((dto.details as any).number).toBe(42);
        });

        it('should handle empty errors array', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Bad Request';
            dto.message = 'Validation failed';
            dto.path = '/api/test';
            dto.statusCode = 400;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-empty';
            dto.errors = [];

            expect(dto.errors).toEqual([]);
            expect(dto.errors).toHaveLength(0);
        });

        it('should handle empty fieldErrors object', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Bad Request';
            dto.message = 'Validation failed';
            dto.path = '/api/test';
            dto.statusCode = 400;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-empty-fields';
            dto.fieldErrors = {};

            expect(dto.fieldErrors).toEqual({});
            expect(Object.keys(dto.fieldErrors)).toHaveLength(0);
        });

        it('should handle long stack trace', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Internal Server Error';
            dto.message = 'Error occurred';
            dto.path = '/api/test';
            dto.statusCode = 500;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-stack';
            dto.stack = `Error: Test error
  at Object.<anonymous> (/app/src/test.ts:10:15)
  at Module._compile (node:internal/modules/cjs/loader:1159:14)
  at Object.Module._extensions..js (node:internal/modules/cjs/loader:1213:10)
  at Module.load (node:internal/modules/cjs/loader:1037:32)`;

            expect(dto.stack).toContain('Error: Test error');
            expect(dto.stack).toContain('at Object.<anonymous>');
            expect(dto.stack).toContain('at Module._compile');
        });

        it('should handle various HTTP status codes', () => {
            const statusCodes = [400, 401, 403, 404, 422, 429, 500, 502, 503, 504];

            statusCodes.forEach((code) => {
                const dto = new ErrorResponseDto();

                dto.error = 'Error';
                dto.message = 'Test error';
                dto.path = '/api/test';
                dto.statusCode = code;
                dto.timestamp = new Date().toISOString();
                dto.requestId = `req-${code}`;

                expect(dto.statusCode).toBe(code);
            });
        });
    });

    describe('Real-world Scenarios', () => {
        it('should represent a Zod validation error', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Bad Request';
            dto.message = 'Validation failed';
            dto.path = '/api/users';
            dto.statusCode = 400;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-zod';
            dto.errors = [
                'email: Invalid email format',
                'age: Expected number, received string',
                'name: String must contain at least 1 character(s)',
            ];

            expect(dto.errors).toHaveLength(3);
            expect(dto.errors?.[0]).toContain('Invalid email format');
            expect(dto.errors?.[1]).toContain('Expected number');
            expect(dto.errors?.[2]).toContain('at least 1 character');
        });

        it('should represent a database error in production', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Internal Server Error';
            dto.message = 'An unexpected error occurred while processing your request';
            dto.path = '/api/data';
            dto.statusCode = 500;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-db-prod';
            // No stack, method, userAgent, or details in production

            expect(dto.statusCode).toBe(500);
            expect(dto.stack).toBeUndefined();
            expect(dto.method).toBeUndefined();
            expect(dto.userAgent).toBeUndefined();
            expect(dto.details).toBeUndefined();
        });

        it('should represent a timeout error', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Gateway Timeout';
            dto.message = 'Request timeout';
            dto.path = '/api/external-service';
            dto.statusCode = 504;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-timeout';
            dto.details = { service: 'external-api', timeout: 30000 };

            expect(dto.statusCode).toBe(504);
            expect(dto.error).toBe('Gateway Timeout');
            expect(dto.details?.timeout).toBe(30000);
            expect(dto.details?.service).toBe('external-api');
        });

        it('should represent a rate limit error with retry information', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Too Many Requests';
            dto.message = 'Rate limit exceeded. Please try again later.';
            dto.path = '/api/data';
            dto.statusCode = 429;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-rate-limit';
            dto.details = {
                limit: 100,
                remaining: 0,
                reset: new Date(Date.now() + 60000).toISOString(),
                retryAfter: 60,
            };

            expect(dto.statusCode).toBe(429);
            expect(dto.details?.limit).toBe(100);
            expect(dto.details?.remaining).toBe(0);
            expect(dto.details?.retryAfter).toBe(60);
        });

        it('should represent a sanitized error (sensitive data removed)', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Internal Server Error';
            dto.message = 'An unexpected error occurred';
            dto.path = '/api/users';
            dto.statusCode = 500;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-sanitized';
            // Original message might have contained "password" or "token"
            // but was sanitized to generic message

            expect(dto.message).not.toContain('password');
            expect(dto.message).not.toContain('token');
            expect(dto.message).not.toContain('secret');
            expect(dto.message).toBe('An unexpected error occurred');
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined optional properties', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Error';
            dto.message = 'Test';
            dto.path = '/test';
            dto.statusCode = 500;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-undef';

            expect(dto.details).toBeUndefined();
            expect(dto.errors).toBeUndefined();
            expect(dto.fieldErrors).toBeUndefined();
            expect(dto.method).toBeUndefined();
            expect(dto.stack).toBeUndefined();
            expect(dto.userAgent).toBeUndefined();
        });

        it('should handle very long error messages', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Bad Request';
            dto.message = 'A'.repeat(1000);
            dto.path = '/api/test';
            dto.statusCode = 400;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-long';

            expect(dto.message).toHaveLength(1000);
            expect(dto.message).toBe('A'.repeat(1000));
        });

        it('should handle special characters in error messages', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Bad Request';
            dto.message = 'Error: <script>alert("xss")</script>';
            dto.path = '/api/test';
            dto.statusCode = 400;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-special';

            expect(dto.message).toContain('<script>');
            expect(dto.message).toContain('alert');
        });

        it('should handle multiple validation errors with fieldErrors', () => {
            const dto = new ErrorResponseDto();

            dto.error = 'Bad Request';
            dto.message = 'Multiple validation errors';
            dto.path = '/api/users';
            dto.statusCode = 400;
            dto.timestamp = new Date().toISOString();
            dto.requestId = 'req-multi';
            dto.errors = ['Email is invalid', 'Password is too short', 'Name is required'];
            dto.fieldErrors = {
                name: { isNotEmpty: 'name should not be empty' },
                email: { isEmail: 'email must be an email' },
                password: { minLength: 'password must be longer than or equal to 8 characters' },
            };

            expect(dto.errors).toHaveLength(3);
            expect(Object.keys(dto.fieldErrors)).toHaveLength(3);
            expect(dto.fieldErrors).toHaveProperty('email');
            expect(dto.fieldErrors).toHaveProperty('password');
            expect(dto.fieldErrors).toHaveProperty('name');
        });
    });
});
