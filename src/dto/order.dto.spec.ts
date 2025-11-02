import { OrderDto } from './order.dto';

describe('OrderDto', () => {
    describe('structure', () => {
        it('should have correct properties', () => {
            const order = new OrderDto();

            expect(order).toHaveProperty('direction');
            expect(order).toHaveProperty('field');
        });

        it('should allow ascending direction (1)', () => {
            const order = new OrderDto();

            order.direction = 1;
            order.field = 'name';

            expect(order.direction).toBe(1);
            expect(order.field).toBe('name');
        });

        it('should allow descending direction (-1)', () => {
            const order = new OrderDto();

            order.direction = -1;
            order.field = 'createdAt';

            expect(order.direction).toBe(-1);
            expect(order.field).toBe('createdAt');
        });
    });

    describe('real-world scenarios', () => {
        it('should work for sorting by creation date descending', () => {
            const order = new OrderDto();

            order.field = 'createdAt';
            order.direction = -1;

            expect(order.field).toBe('createdAt');
            expect(order.direction).toBe(-1);
        });

        it('should work for sorting by name ascending', () => {
            const order = new OrderDto();

            order.field = 'name';
            order.direction = 1;

            expect(order.field).toBe('name');
            expect(order.direction).toBe(1);
        });

        it('should work for sorting by price descending', () => {
            const order = new OrderDto();

            order.field = 'price';
            order.direction = -1;

            expect(order.field).toBe('price');
            expect(order.direction).toBe(-1);
        });

        it('should work with multiple sort fields (array)', () => {
            const orders: OrderDto[] = [
                { direction: 1, field: 'category' },
                { direction: -1, field: 'price' },
                { direction: 1, field: 'name' },
            ];

            expect(orders).toHaveLength(3);
            expect(orders[0].field).toBe('category');
            expect(orders[0].direction).toBe(1);
            expect(orders[1].field).toBe('price');
            expect(orders[1].direction).toBe(-1);
            expect(orders[2].field).toBe('name');
            expect(orders[2].direction).toBe(1);
        });
    });

    describe('edge cases', () => {
        it('should handle special field names', () => {
            const order = new OrderDto();

            order.field = 'user.profile.name';
            order.direction = 1;

            expect(order.field).toBe('user.profile.name');
        });

        it('should handle field names with underscores', () => {
            const order = new OrderDto();

            order.field = 'created_at';
            order.direction = -1;

            expect(order.field).toBe('created_at');
        });

        it('should handle field names with numbers', () => {
            const order = new OrderDto();

            order.field = 'field123';
            order.direction = 1;

            expect(order.field).toBe('field123');
        });
    });
});
