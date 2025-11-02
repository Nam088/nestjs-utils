/* eslint-disable max-lines-per-function */
import { PaginationDto } from './pagination.dto';

describe('PaginationDto', () => {
    describe('default values', () => {
        it('should have default limit of 10', () => {
            const pagination = new PaginationDto();

            expect(pagination.limit).toBe(10);
        });

        it('should have default page of 1', () => {
            const pagination = new PaginationDto();

            expect(pagination.page).toBe(1);
        });

        it('should have undefined search query by default', () => {
            const pagination = new PaginationDto();

            expect(pagination.q).toBeUndefined();
        });
    });

    describe('custom values', () => {
        it('should allow setting custom limit', () => {
            const pagination = new PaginationDto();

            pagination.limit = 25;

            expect(pagination.limit).toBe(25);
        });

        it('should allow setting custom page', () => {
            const pagination = new PaginationDto();

            pagination.page = 5;

            expect(pagination.page).toBe(5);
        });

        it('should allow setting search query', () => {
            const pagination = new PaginationDto();

            pagination.q = 'test search';

            expect(pagination.q).toBe('test search');
        });

        it('should allow setting all properties', () => {
            const pagination = new PaginationDto();

            pagination.limit = 50;
            pagination.page = 3;
            pagination.q = 'search term';

            expect(pagination.limit).toBe(50);
            expect(pagination.page).toBe(3);
            expect(pagination.q).toBe('search term');
        });
    });

    describe('boundary values', () => {
        it('should handle minimum limit (1)', () => {
            const pagination = new PaginationDto();

            pagination.limit = 1;

            expect(pagination.limit).toBe(1);
        });

        it('should handle maximum limit (100)', () => {
            const pagination = new PaginationDto();

            pagination.limit = 100;

            expect(pagination.limit).toBe(100);
        });

        it('should handle first page', () => {
            const pagination = new PaginationDto();

            pagination.page = 1;

            expect(pagination.page).toBe(1);
        });

        it('should handle large page numbers', () => {
            const pagination = new PaginationDto();

            pagination.page = 999;

            expect(pagination.page).toBe(999);
        });
    });

    describe('search functionality', () => {
        it('should handle empty search query', () => {
            const pagination = new PaginationDto();

            pagination.q = '';

            expect(pagination.q).toBe('');
        });

        it('should handle search with special characters', () => {
            const pagination = new PaginationDto();

            pagination.q = 'test@example.com';

            expect(pagination.q).toBe('test@example.com');
        });

        it('should handle search with spaces', () => {
            const pagination = new PaginationDto();

            pagination.q = 'multiple word search';

            expect(pagination.q).toBe('multiple word search');
        });

        it('should handle search with unicode characters', () => {
            const pagination = new PaginationDto();

            pagination.q = 'Myriad Pro';

            expect(pagination.q).toBe('Myriad Pro');
        });
    });

    describe('real-world scenarios', () => {
        it('should work for first page with default limit', () => {
            const pagination = new PaginationDto();

            expect(pagination.page).toBe(1);
            expect(pagination.limit).toBe(10);
        });

        it('should work for paginated search results', () => {
            const pagination = new PaginationDto();

            pagination.page = 2;
            pagination.limit = 20;
            pagination.q = 'product name';

            expect(pagination.page).toBe(2);
            expect(pagination.limit).toBe(20);
            expect(pagination.q).toBe('product name');
        });

        it('should work for large result sets', () => {
            const pagination = new PaginationDto();

            pagination.page = 10;
            pagination.limit = 100;

            expect(pagination.page).toBe(10);
            expect(pagination.limit).toBe(100);
        });

        it('should calculate offset correctly (page 1)', () => {
            const pagination = new PaginationDto();

            pagination.page = 1;
            pagination.limit = 10;

            const offset = (pagination.page - 1) * pagination.limit;

            expect(offset).toBe(0);
        });

        it('should calculate offset correctly (page 3)', () => {
            const pagination = new PaginationDto();

            pagination.page = 3;
            pagination.limit = 20;

            const offset = (pagination.page - 1) * pagination.limit;

            expect(offset).toBe(40);
        });
    });

    describe('edge cases', () => {
        it('should handle undefined limit', () => {
            const pagination = new PaginationDto();

            pagination.limit = undefined;

            expect(pagination.limit).toBeUndefined();
        });

        it('should handle undefined page', () => {
            const pagination = new PaginationDto();

            pagination.page = undefined;

            expect(pagination.page).toBeUndefined();
        });

        it('should handle very long search queries', () => {
            const pagination = new PaginationDto();

            pagination.q = 'a'.repeat(1000);

            expect(pagination.q).toHaveLength(1000);
        });
    });
});
