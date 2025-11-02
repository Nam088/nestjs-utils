/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { createCustomQueryDto, QueryDto } from './query.dto';

describe('QueryDto', () => {
    describe('structure', () => {
        it('should have order property', () => {
            const query = new QueryDto();

            expect(query).toHaveProperty('order');
        });

        it('should have select property', () => {
            const query = new QueryDto();

            expect(query).toHaveProperty('select');
        });

        it('should have filter property', () => {
            const query = new QueryDto();

            expect(query).toHaveProperty('filter');
        });
    });

    describe('ordering', () => {
        it('should allow single order', () => {
            const query = new QueryDto();

            query.order = [{ direction: 1, field: 'name' }];

            expect(query.order).toHaveLength(1);
            expect(query.order[0].field).toBe('name');
            expect(query.order[0].direction).toBe(1);
        });

        it('should allow multiple orders', () => {
            const query = new QueryDto();

            query.order = [
                { direction: 1, field: 'category' },
                { direction: -1, field: 'price' },
            ];

            expect(query.order).toHaveLength(2);
            expect(query.order[0].field).toBe('category');
            expect(query.order[1].field).toBe('price');
        });

        it('should handle undefined order', () => {
            const query = new QueryDto();

            expect(query.order).toBeUndefined();
        });
    });

    describe('field selection', () => {
        it('should allow selecting specific fields', () => {
            const query = new QueryDto();

            query.select = ['id', 'name', 'email'];

            expect(query.select).toHaveLength(3);
            expect(query.select).toContain('id');
            expect(query.select).toContain('name');
            expect(query.select).toContain('email');
        });

        it('should allow selecting single field', () => {
            const query = new QueryDto();

            query.select = ['id'];

            expect(query.select).toHaveLength(1);
            expect(query.select[0]).toBe('id');
        });

        it('should handle undefined select', () => {
            const query = new QueryDto();

            expect(query.select).toBeUndefined();
        });

        it('should allow empty select array', () => {
            const query = new QueryDto();

            query.select = [];

            expect(query.select).toHaveLength(0);
        });
    });

    describe('filtering', () => {
        it('should allow JsonLogic filter', () => {
            const query = new QueryDto();

            query.filter = { '==': [{ var: 'email' }, 'test@example.com'] };

            expect(query.filter).toBeDefined();
            expect(query.filter).toHaveProperty('==');
        });

        it('should allow complex AND filter', () => {
            const query = new QueryDto();

            query.filter = {
                and: [{ '==': [{ var: 'status' }, 'active'] }, { '>': [{ var: 'age' }, 18] }],
            };

            expect(query.filter).toHaveProperty('and');
            expect((query.filter as any).and).toHaveLength(2);
        });

        it('should allow complex OR filter', () => {
            const query = new QueryDto();

            query.filter = {
                or: [{ '==': [{ var: 'role' }, 'admin'] }, { '==': [{ var: 'role' }, 'moderator'] }],
            };

            expect(query.filter).toHaveProperty('or');
        });

        it('should handle undefined filter', () => {
            const query = new QueryDto();

            expect(query.filter).toBeUndefined();
        });
    });

    describe('combined queries', () => {
        it('should allow combining order, select, and filter', () => {
            const query = new QueryDto();

            query.order = [{ direction: -1, field: 'createdAt' }];
            query.select = ['id', 'name', 'email'];
            query.filter = { '==': [{ var: 'status' }, 'active'] };

            expect(query.order).toBeDefined();
            expect(query.select).toBeDefined();
            expect(query.filter).toBeDefined();
        });

        it('should work with all properties undefined', () => {
            const query = new QueryDto();

            expect(query.order).toBeUndefined();
            expect(query.select).toBeUndefined();
            expect(query.filter).toBeUndefined();
        });
    });

    describe('real-world scenarios', () => {
        it('should work for user listing with filters', () => {
            const query = new QueryDto();

            query.filter = {
                and: [{ '==': [{ var: 'status' }, 'active'] }, { '>=': [{ var: 'age' }, 18] }],
            };
            query.order = [{ direction: -1, field: 'createdAt' }];
            query.select = ['id', 'email', 'firstName', 'lastName'];

            expect(query.filter).toBeDefined();
            expect(query.order).toHaveLength(1);
            expect(query.select).toHaveLength(4);
        });

        it('should work for product search', () => {
            const query = new QueryDto();

            query.filter = {
                and: [{ '==': [{ var: 'category' }, 'electronics'] }, { '<': [{ var: 'price' }, 1000] }],
            };
            query.order = [
                { direction: 1, field: 'price' },
                { direction: -1, field: 'rating' },
            ];

            expect(query.filter).toBeDefined();
            expect(query.order).toHaveLength(2);
        });

        it('should work for simple listing without filters', () => {
            const query = new QueryDto();

            query.order = [{ direction: 1, field: 'name' }];

            expect(query.order).toBeDefined();
            expect(query.filter).toBeUndefined();
            expect(query.select).toBeUndefined();
        });
    });
});

describe('createCustomQueryDto', () => {
    describe('factory function', () => {
        it('should create a custom query DTO class', () => {
            const CustomQueryDto = createCustomQueryDto({
                '==': [{ var: 'status' }, 'active'],
            });

            expect(CustomQueryDto).toBeDefined();
            expect(typeof CustomQueryDto).toBe('function');
        });

        it('should create instances with filter property', () => {
            const CustomQueryDto = createCustomQueryDto({
                '==': [{ var: 'status' }, 'active'],
            });
            const query = new CustomQueryDto();

            expect(query).toHaveProperty('filter');
        });

        it('should create instances with order property', () => {
            const CustomQueryDto = createCustomQueryDto({
                '==': [{ var: 'status' }, 'active'],
            });
            const query = new CustomQueryDto();

            expect(query).toHaveProperty('order');
        });

        it('should create instances with select property', () => {
            const CustomQueryDto = createCustomQueryDto({
                '==': [{ var: 'status' }, 'active'],
            });
            const query = new CustomQueryDto();

            expect(query).toHaveProperty('select');
        });
    });

    describe('custom filter examples', () => {
        it('should work with simple equality filter', () => {
            const CustomQueryDto = createCustomQueryDto({
                '==': [{ var: 'role' }, 'admin'],
            });
            const query = new CustomQueryDto();

            query.filter = { '==': [{ var: 'role' }, 'admin'] };

            expect(query.filter).toBeDefined();
        });

        it('should work with complex AND filter', () => {
            const CustomQueryDto = createCustomQueryDto({
                and: [{ '==': [{ var: 'status' }, 'active'] }, { '>': [{ var: 'age' }, 18] }],
            });
            const query = new CustomQueryDto();

            query.filter = {
                and: [{ '==': [{ var: 'status' }, 'active'] }, { '>': [{ var: 'age' }, 18] }],
            };

            expect(query.filter).toHaveProperty('and');
        });

        it('should work with range filter', () => {
            const CustomQueryDto = createCustomQueryDto({
                and: [{ '>=': [{ var: 'price' }, 100] }, { '<=': [{ var: 'price' }, 500] }],
            });
            const query = new CustomQueryDto();

            query.filter = {
                and: [{ '>=': [{ var: 'price' }, 100] }, { '<=': [{ var: 'price' }, 500] }],
            };

            expect(query.filter).toBeDefined();
        });
    });

    describe('inheritance', () => {
        it('should inherit order functionality', () => {
            const CustomQueryDto = createCustomQueryDto({});
            const query = new CustomQueryDto();

            query.order = [{ direction: 1, field: 'name' }];

            expect(query.order).toBeDefined();
            expect(query.order).toHaveLength(1);
        });

        it('should inherit select functionality', () => {
            const CustomQueryDto = createCustomQueryDto({});
            const query = new CustomQueryDto();

            query.select = ['id', 'name'];

            expect(query.select).toBeDefined();
            expect(query.select).toHaveLength(2);
        });

        it('should work with all inherited properties', () => {
            const CustomQueryDto = createCustomQueryDto({});
            const query = new CustomQueryDto();

            query.order = [{ direction: -1, field: 'createdAt' }];
            query.select = ['id', 'name'];
            query.filter = { '==': [{ var: 'status' }, 'active'] };

            expect(query.order).toBeDefined();
            expect(query.select).toBeDefined();
            expect(query.filter).toBeDefined();
        });
    });
});
