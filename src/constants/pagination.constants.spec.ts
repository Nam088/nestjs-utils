/* eslint-disable max-lines-per-function */
import { PAGINATION_TYPE } from './pagination.constants';

import type { PaginationType } from './pagination.constants';

describe('PAGINATION_TYPE', () => {
    describe('constant values', () => {
        it('should have OFFSET constant', () => {
            expect(PAGINATION_TYPE.OFFSET).toBe('offset');
        });

        it('should have CURSOR constant', () => {
            expect(PAGINATION_TYPE.CURSOR).toBe('cursor');
        });
    });

    describe('object structure', () => {
        it('should have exactly 2 pagination types', () => {
            const keys = Object.keys(PAGINATION_TYPE);

            expect(keys).toHaveLength(2);
        });

        it('should contain all expected keys', () => {
            expect(PAGINATION_TYPE).toHaveProperty('OFFSET');
            expect(PAGINATION_TYPE).toHaveProperty('CURSOR');
        });

        it('should be immutable (as const)', () => {
            // TypeScript will prevent this at compile time
            // This test just verifies the values are correct
            expect(PAGINATION_TYPE.OFFSET).toBe('offset');
            expect(PAGINATION_TYPE.CURSOR).toBe('cursor');
        });
    });

    describe('usage in switch statements', () => {
        it('should work in switch statements', () => {
            const getPaginationDescription = (type: PaginationType): string => {
                switch (type) {
                    case PAGINATION_TYPE.CURSOR:
                        return 'Cursor-based pagination';

                    case PAGINATION_TYPE.OFFSET:
                        return 'Offset-based pagination';

                    default:
                        return 'Unknown';
                }
            };

            expect(getPaginationDescription(PAGINATION_TYPE.OFFSET)).toBe('Offset-based pagination');
            expect(getPaginationDescription(PAGINATION_TYPE.CURSOR)).toBe('Cursor-based pagination');
        });
    });

    describe('usage in comparisons', () => {
        it('should work in equality comparisons', () => {
            const paginationType: PaginationType = 'offset';

            expect(paginationType === PAGINATION_TYPE.OFFSET).toBe(true);

            const anotherType: PaginationType = 'cursor';

            expect(anotherType === PAGINATION_TYPE.CURSOR).toBe(true);
        });

        it('should work with string literals', () => {
            expect(PAGINATION_TYPE.OFFSET).toBe('offset');
            expect(PAGINATION_TYPE.CURSOR).toBe('cursor');
        });
    });

    describe('real-world scenarios', () => {
        it('should work for pagination middleware', () => {
            const getPaginationParams = (type: PaginationType) => {
                if (type === PAGINATION_TYPE.OFFSET) {
                    return { limit: 10, page: 1 };
                }

                if (type === PAGINATION_TYPE.CURSOR) {
                    return { cursor: null, limit: 10 };
                }

                return null;
            };

            const offsetParams = getPaginationParams(PAGINATION_TYPE.OFFSET);

            expect(offsetParams).toEqual({ limit: 10, page: 1 });

            const cursorParams = getPaginationParams(PAGINATION_TYPE.CURSOR);

            expect(cursorParams).toEqual({ cursor: null, limit: 10 });
        });

        it('should work for API configuration', () => {
            interface PaginationConfig {
                defaultLimit: number;
                type: PaginationType;
            }

            const config: PaginationConfig = {
                type: PAGINATION_TYPE.OFFSET,
                defaultLimit: 20,
            };

            expect(config.type).toBe('offset');
            expect(config.defaultLimit).toBe(20);
        });

        it('should work for pagination strategy selection', () => {
            const selectPaginationStrategy = (type: PaginationType): string =>
                type === PAGINATION_TYPE.CURSOR
                    ? 'Use cursor-based for large datasets'
                    : 'Use offset-based for simple pagination';

            expect(selectPaginationStrategy(PAGINATION_TYPE.OFFSET)).toBe('Use offset-based for simple pagination');
            expect(selectPaginationStrategy(PAGINATION_TYPE.CURSOR)).toBe('Use cursor-based for large datasets');
        });

        it('should work for pagination type validation', () => {
            const isValidPaginationType = (type: string): type is PaginationType =>
                Object.values(PAGINATION_TYPE).includes(type as PaginationType);

            expect(isValidPaginationType('offset')).toBe(true);
            expect(isValidPaginationType('cursor')).toBe(true);
            expect(isValidPaginationType('invalid')).toBe(false);
        });

        it('should work for building paginated responses', () => {
            interface PaginatedResponse<T> {
                data: T[];
                pagination: {
                    cursor?: null | string;
                    limit?: number;
                    page?: number;
                    type: PaginationType;
                };
            }

            const offsetResponse: PaginatedResponse<{ id: number }> = {
                data: [{ id: 1 }, { id: 2 }],
                pagination: {
                    type: PAGINATION_TYPE.OFFSET,
                    limit: 10,
                    page: 1,
                },
            };

            const cursorResponse: PaginatedResponse<{ id: number }> = {
                data: [{ id: 1 }, { id: 2 }],
                pagination: {
                    type: PAGINATION_TYPE.CURSOR,
                    cursor: 'abc123',
                    limit: 10,
                },
            };

            expect(offsetResponse.pagination.type).toBe('offset');
            expect(offsetResponse.pagination.page).toBe(1);

            expect(cursorResponse.pagination.type).toBe('cursor');
            expect(cursorResponse.pagination.cursor).toBe('abc123');
        });
    });

    describe('type safety', () => {
        it('should enforce PaginationType type', () => {
            const validType: PaginationType = PAGINATION_TYPE.OFFSET;

            expect(validType).toBe('offset');
        });

        it('should work with all pagination types', () => {
            const types: PaginationType[] = [PAGINATION_TYPE.OFFSET, PAGINATION_TYPE.CURSOR];

            expect(types).toHaveLength(2);
            expect(types).toContain('offset');
            expect(types).toContain('cursor');
        });
    });

    describe('use cases', () => {
        it('should support offset pagination for simple lists', () => {
            const type = PAGINATION_TYPE.OFFSET;
            const page = 2;
            const limit = 20;
            const offset = (page - 1) * limit;

            expect(type).toBe('offset');
            expect(offset).toBe(20);
        });

        it('should support cursor pagination for infinite scroll', () => {
            const type = PAGINATION_TYPE.CURSOR;
            const cursor = 'eyJpZCI6MTAwfQ=='; // Base64 encoded cursor
            const limit = 50;

            expect(type).toBe('cursor');
            expect(cursor).toBeDefined();
            expect(limit).toBe(50);
        });

        it('should help choose pagination strategy based on use case', () => {
            const chooseStrategy = (isRealtime: boolean): PaginationType =>
                isRealtime ? PAGINATION_TYPE.CURSOR : PAGINATION_TYPE.OFFSET;

            expect(chooseStrategy(true)).toBe('cursor');
            expect(chooseStrategy(false)).toBe('offset');
        });
    });
});
