/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import {
    ApiCursorPaginatedResponseData,
    ApiCursorPaginatedResponseDto,
    ApiPaginatedResponseData,
    ApiPaginatedResponseDto,
    CursorPaging,
    Paging,
} from './paginated.response.dto';

// Mock DTOs for testing
class TestUserDto {
    id!: number;
    name!: string;
}

describe('Paging', () => {
    describe('Constructor', () => {
        it('should create a Paging instance with required fields', () => {
            const paging = new Paging({
                limit: 10,
                page: 1,
                total: 100,
            });

            expect(paging.page).toBe(1);
            expect(paging.limit).toBe(10);
            expect(paging.total).toBe(100);
            expect(paging.totalPages).toBe(10);
        });

        it('should calculate totalPages automatically', () => {
            const paging = new Paging({
                limit: 10,
                page: 1,
                total: 95,
            });

            expect(paging.totalPages).toBe(10); // Math.ceil(95 / 10) = 10
        });

        it('should use provided totalPages if given', () => {
            const paging = new Paging({
                limit: 10,
                page: 1,
                total: 100,
                totalPages: 15,
            });

            expect(paging.totalPages).toBe(15);
        });

        it('should calculate hasPreviousPage automatically', () => {
            const paging1 = new Paging({ limit: 10, page: 1, total: 100 });
            const paging2 = new Paging({ limit: 10, page: 2, total: 100 });

            expect(paging1.hasPreviousPage).toBe(false);
            expect(paging2.hasPreviousPage).toBe(true);
        });

        it('should calculate hasNextPage automatically', () => {
            const paging1 = new Paging({ limit: 10, page: 1, total: 100 });
            const paging2 = new Paging({ limit: 10, page: 10, total: 100 });

            expect(paging1.hasNextPage).toBe(true);
            expect(paging2.hasNextPage).toBe(false);
        });

        it('should calculate offset automatically', () => {
            const paging1 = new Paging({ limit: 10, page: 1, total: 100 });
            const paging2 = new Paging({ limit: 10, page: 3, total: 100 });

            expect(paging1.offset).toBe(0);
            expect(paging2.offset).toBe(20);
        });

        it('should calculate startItem and endItem automatically', () => {
            const paging = new Paging({ limit: 10, page: 2, total: 95 });

            expect(paging.startItem).toBe(11); // offset + 1
            expect(paging.endItem).toBe(20); // min(offset + limit, total)
        });

        it('should handle last page correctly', () => {
            const paging = new Paging({ limit: 10, page: 10, total: 95 });

            expect(paging.endItem).toBe(95); // Should not exceed total
            expect(paging.hasNextPage).toBe(false);
        });

        it('should accept all optional fields', () => {
            const paging = new Paging({
                currentPageSize: 10,
                endItem: 20,
                firstPage: 1,
                hasNextPage: true,
                hasPreviousPage: false,
                lastPage: 10,
                limit: 10,
                offset: 0,
                page: 1,
                startItem: 1,
                total: 100,
                totalPages: 10,
            });

            expect(paging.currentPageSize).toBe(10);
            expect(paging.endItem).toBe(20);
            expect(paging.firstPage).toBe(1);
            expect(paging.hasNextPage).toBe(true);
            expect(paging.hasPreviousPage).toBe(false);
            expect(paging.lastPage).toBe(10);
            expect(paging.offset).toBe(0);
            expect(paging.startItem).toBe(1);
        });
    });

    describe('Static create method', () => {
        it('should create a Paging instance', () => {
            const paging = Paging.create({
                limit: 10,
                page: 1,
                total: 100,
            });

            expect(paging).toBeInstanceOf(Paging);
            expect(paging.page).toBe(1);
            expect(paging.limit).toBe(10);
            expect(paging.total).toBe(100);
        });

        it('should work with totalPages parameter', () => {
            const paging = Paging.create({
                limit: 10,
                page: 1,
                total: 100,
                totalPages: 15,
            });

            expect(paging.totalPages).toBe(15);
        });
    });

    describe('Static createWithAutoCalculation method', () => {
        it('should create a Paging instance with auto-calculated values', () => {
            const paging = Paging.createWithAutoCalculation({
                currentPageSize: 10,
                limit: 10,
                page: 2,
                total: 95,
            });

            expect(paging.page).toBe(2);
            expect(paging.limit).toBe(10);
            expect(paging.total).toBe(95);
            expect(paging.totalPages).toBe(10);
            expect(paging.offset).toBe(10);
            expect(paging.startItem).toBe(11);
            expect(paging.endItem).toBe(20);
            expect(paging.hasPreviousPage).toBe(true);
            expect(paging.hasNextPage).toBe(true);
            expect(paging.firstPage).toBe(1);
            expect(paging.lastPage).toBe(10);
            expect(paging.currentPageSize).toBe(10);
        });

        it('should handle first page correctly', () => {
            const paging = Paging.createWithAutoCalculation({
                limit: 10,
                page: 1,
                total: 100,
            });

            expect(paging.hasPreviousPage).toBe(false);
            expect(paging.hasNextPage).toBe(true);
            expect(paging.startItem).toBe(1);
            expect(paging.endItem).toBe(10);
        });

        it('should handle last page correctly', () => {
            const paging = Paging.createWithAutoCalculation({
                limit: 10,
                page: 10,
                total: 95,
            });

            expect(paging.hasPreviousPage).toBe(true);
            expect(paging.hasNextPage).toBe(false);
            expect(paging.endItem).toBe(95);
        });

        it('should handle single page', () => {
            const paging = Paging.createWithAutoCalculation({
                limit: 10,
                page: 1,
                total: 5,
            });

            expect(paging.totalPages).toBe(1);
            expect(paging.hasPreviousPage).toBe(false);
            expect(paging.hasNextPage).toBe(false);
            expect(paging.startItem).toBe(1);
            expect(paging.endItem).toBe(5);
        });

        it('should handle empty results', () => {
            const paging = Paging.createWithAutoCalculation({
                limit: 10,
                page: 1,
                total: 0,
            });

            expect(paging.totalPages).toBe(0);
            expect(paging.hasPreviousPage).toBe(false);
            expect(paging.hasNextPage).toBe(false);
            expect(paging.startItem).toBe(1);
            expect(paging.endItem).toBe(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle page beyond total pages', () => {
            const paging = new Paging({
                limit: 10,
                page: 20,
                total: 50,
            });

            expect(paging.totalPages).toBe(5);
            expect(paging.hasNextPage).toBe(false);
            expect(paging.offset).toBe(190);
        });

        it('should handle zero limit gracefully', () => {
            const paging = new Paging({
                limit: 0,
                page: 1,
                total: 100,
            });

            expect(paging.totalPages).toBe(Infinity);
        });

        it('should handle large numbers', () => {
            const paging = new Paging({
                limit: 100,
                page: 1000,
                total: 1000000,
            });

            expect(paging.totalPages).toBe(10000);
            expect(paging.offset).toBe(99900);
            expect(paging.startItem).toBe(99901);
            expect(paging.endItem).toBe(100000);
        });
    });
});

describe('ApiPaginatedResponseData', () => {
    describe('Constructor', () => {
        it('should create an ApiPaginatedResponseData instance', () => {
            const paging = new Paging({ limit: 10, page: 1, total: 2 });
            const data = [
                { id: 1, name: 'User 1' },
                { id: 2, name: 'User 2' },
            ];

            const response = new ApiPaginatedResponseData({
                data,
                paging,
            });

            expect(response.data).toEqual(data);
            expect(response.paging).toBe(paging);
            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('Success');
        });

        it('should accept custom statusCode and message', () => {
            const paging = new Paging({ limit: 10, page: 1, total: 1 });
            const data = [{ id: 1, name: 'User 1' }];

            const response = new ApiPaginatedResponseData({
                data,
                message: 'Users retrieved successfully',
                paging,
                statusCode: 201,
            });

            expect(response.statusCode).toBe(201);
            expect(response.message).toBe('Users retrieved successfully');
        });

        it('should handle empty data array', () => {
            const paging = new Paging({ limit: 10, page: 1, total: 0 });
            const response = new ApiPaginatedResponseData({
                data: [],
                paging,
            });

            expect(response.data).toEqual([]);
            expect(response.paging.total).toBe(0);
        });
    });

    describe('Static create method', () => {
        it('should create an ApiPaginatedResponseData instance', () => {
            const paging = new Paging({ limit: 10, page: 1, total: 2 });
            const data = [
                { id: 1, name: 'User 1' },
                { id: 2, name: 'User 2' },
            ];

            const response = ApiPaginatedResponseData.create(data, paging);

            expect(response).toBeInstanceOf(ApiPaginatedResponseData);
            expect(response.data).toEqual(data);
            expect(response.paging).toBe(paging);
            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('Success');
        });

        it('should accept custom message and statusCode', () => {
            const paging = new Paging({ limit: 10, page: 1, total: 1 });
            const data = [{ id: 1, name: 'User 1' }];

            const response = ApiPaginatedResponseData.create(data, paging, 'Custom message', 201);

            expect(response.message).toBe('Custom message');
            expect(response.statusCode).toBe(201);
        });
    });

    describe('Static createWithAutoPaging method', () => {
        it('should create response with auto-calculated paging', () => {
            const data = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));

            const response = ApiPaginatedResponseData.createWithAutoPaging({
                data,
                limit: 10,
                page: 1,
                total: 95,
            });

            expect(response.data).toEqual(data);
            expect(response.paging.page).toBe(1);
            expect(response.paging.limit).toBe(10);
            expect(response.paging.total).toBe(95);
            expect(response.paging.totalPages).toBe(10);
            expect(response.paging.currentPageSize).toBe(10);
        });

        it('should accept custom message and statusCode', () => {
            const data = [{ id: 1, name: 'User 1' }];

            const response = ApiPaginatedResponseData.createWithAutoPaging({
                data,
                limit: 10,
                message: 'Custom success',
                page: 1,
                statusCode: 201,
                total: 1,
            });

            expect(response.message).toBe('Custom success');
            expect(response.statusCode).toBe(201);
        });

        it('should handle last page with partial results', () => {
            const data = Array.from({ length: 5 }, (_, i) => ({ id: i + 91, name: `User ${i + 91}` }));

            const response = ApiPaginatedResponseData.createWithAutoPaging({
                data,
                limit: 10,
                page: 10,
                total: 95,
            });

            expect(response.data).toHaveLength(5);
            expect(response.paging.currentPageSize).toBe(5);
            expect(response.paging.endItem).toBe(95);
        });

        it('should handle empty results', () => {
            const response = ApiPaginatedResponseData.createWithAutoPaging({
                data: [],
                limit: 10,
                page: 1,
                total: 0,
            });

            expect(response.data).toEqual([]);
            expect(response.paging.total).toBe(0);
            expect(response.paging.currentPageSize).toBe(0);
        });
    });

    describe('Real-world Scenarios', () => {
        it('should handle user list pagination', () => {
            const users = Array.from({ length: 10 }, (_, i) => ({
                id: i + 1,
                name: `User ${i + 1}`,
                email: `user${i + 1}@example.com`,
            }));

            const response = ApiPaginatedResponseData.createWithAutoPaging({
                data: users,
                limit: 10,
                message: 'Users retrieved successfully',
                page: 1,
                total: 100,
            });

            expect(response.data).toHaveLength(10);
            expect(response.paging.hasNextPage).toBe(true);
            expect(response.paging.hasPreviousPage).toBe(false);
        });

        it('should handle product catalog pagination', () => {
            const products = Array.from({ length: 20 }, (_, i) => ({
                id: i + 21,
                name: `Product ${i + 21}`,
                price: (i + 1) * 10,
            }));

            const response = ApiPaginatedResponseData.createWithAutoPaging({
                data: products,
                limit: 20,
                message: 'Products retrieved',
                page: 2,
                total: 150,
            });

            expect(response.data).toHaveLength(20);
            expect(response.paging.page).toBe(2);
            expect(response.paging.startItem).toBe(21);
            expect(response.paging.endItem).toBe(40);
        });
    });
});

describe('ApiPaginatedResponseDto', () => {
    it('should create a paginated response DTO class', () => {
        const PaginatedUserDto = ApiPaginatedResponseDto(TestUserDto);

        expect(PaginatedUserDto).toBeDefined();
        expect(PaginatedUserDto.name).toBe('ApiPaginatedResponseOfTestUserDto');
    });

    it('should create an instance of the DTO', () => {
        const PaginatedUserDto = ApiPaginatedResponseDto(TestUserDto);
        const instance = new PaginatedUserDto();

        expect(instance).toBeInstanceOf(PaginatedUserDto);
    });

    it('should have correct property structure', () => {
        const PaginatedUserDto = ApiPaginatedResponseDto(TestUserDto);
        const instance = new PaginatedUserDto();

        instance.data = [{ id: 1, name: 'Test' }];
        instance.message = 'Success';
        instance.paging = new Paging({ limit: 10, page: 1, total: 1 });
        instance.statusCode = 200;

        expect(instance.data).toEqual([{ id: 1, name: 'Test' }]);
        expect(instance.message).toBe('Success');
        expect(instance.paging).toBeInstanceOf(Paging);
        expect(instance.statusCode).toBe(200);
    });

    it('should create unique class names for different types', () => {
        class ProductDto {
            id!: number;
            name!: string;
        }

        const PaginatedUserDto = ApiPaginatedResponseDto(TestUserDto);
        const PaginatedProductDto = ApiPaginatedResponseDto(ProductDto);

        expect(PaginatedUserDto.name).toBe('ApiPaginatedResponseOfTestUserDto');
        expect(PaginatedProductDto.name).toBe('ApiPaginatedResponseOfProductDto');
        expect(PaginatedUserDto.name).not.toBe(PaginatedProductDto.name);
    });
});

describe('CursorPaging', () => {
    describe('Constructor', () => {
        it('should create a CursorPaging instance with required fields', () => {
            const cursorPaging = new CursorPaging({
                hasNextPage: true,
                nextCursor: 'eyJpZCI6MTB9',
            });

            expect(cursorPaging.hasNextPage).toBe(true);
            expect(cursorPaging.nextCursor).toBe('eyJpZCI6MTB9');
        });

        it('should calculate hasPreviousPage from previousCursor', () => {
            const cursorPaging1 = new CursorPaging({
                hasNextPage: true,
                nextCursor: 'next',
                previousCursor: 'prev',
            });

            const cursorPaging2 = new CursorPaging({
                hasNextPage: true,
                nextCursor: 'next',
                previousCursor: null,
            });

            expect(cursorPaging1.hasPreviousPage).toBe(true);
            expect(cursorPaging2.hasPreviousPage).toBe(false);
        });

        it('should accept all optional fields', () => {
            const cursorPaging = new CursorPaging({
                currentPage: 2,
                currentPageSize: 10,
                firstCursor: 'first',
                hasNextPage: true,
                hasPreviousPage: true,
                lastCursor: 'last',
                nextCursor: 'next',
                previousCursor: 'prev',
                total: 100,
                totalPages: 10,
            });

            expect(cursorPaging.currentPage).toBe(2);
            expect(cursorPaging.currentPageSize).toBe(10);
            expect(cursorPaging.firstCursor).toBe('first');
            expect(cursorPaging.hasPreviousPage).toBe(true);
            expect(cursorPaging.lastCursor).toBe('last');
            expect(cursorPaging.previousCursor).toBe('prev');
            expect(cursorPaging.total).toBe(100);
            expect(cursorPaging.totalPages).toBe(10);
        });

        it('should handle null cursors', () => {
            const cursorPaging = new CursorPaging({
                firstCursor: null,
                hasNextPage: false,
                lastCursor: null,
                nextCursor: null,
                previousCursor: null,
            });

            expect(cursorPaging.firstCursor).toBeNull();
            expect(cursorPaging.lastCursor).toBeNull();
            expect(cursorPaging.nextCursor).toBeNull();
            expect(cursorPaging.previousCursor).toBeNull();
        });
    });

    describe('Static create method', () => {
        it('should create a CursorPaging instance', () => {
            const cursorPaging = CursorPaging.create({
                hasNextPage: true,
                nextCursor: 'eyJpZCI6MTB9',
            });

            expect(cursorPaging).toBeInstanceOf(CursorPaging);
            expect(cursorPaging.hasNextPage).toBe(true);
            expect(cursorPaging.nextCursor).toBe('eyJpZCI6MTB9');
        });
    });

    describe('Static createWithAutoCalculation method', () => {
        it('should create CursorPaging with auto-calculated values', () => {
            const data = Array.from({ length: 11 }, (_, i) => ({ id: i + 1 }));

            const cursorPaging = CursorPaging.createWithAutoCalculation({
                data,
                limit: 10,
                nextCursor: 'eyJpZCI6MTF9',
                total: 100,
            });

            expect(cursorPaging.hasNextPage).toBe(true); // data.length > limit
            expect(cursorPaging.currentPageSize).toBe(10); // limit
            expect(cursorPaging.nextCursor).toBe('eyJpZCI6MTF9');
            expect(cursorPaging.total).toBe(100);
            expect(cursorPaging.totalPages).toBe(10);
        });

        it('should detect no next page when data length <= limit', () => {
            const data = Array.from({ length: 5 }, (_, i) => ({ id: i + 1 }));

            const cursorPaging = CursorPaging.createWithAutoCalculation({
                data,
                limit: 10,
                nextCursor: null,
            });

            expect(cursorPaging.hasNextPage).toBe(false);
            expect(cursorPaging.currentPageSize).toBe(5);
        });

        it('should handle previousCursor correctly', () => {
            const data = Array.from({ length: 10 }, (_, i) => ({ id: i + 11 }));

            const cursorPaging = CursorPaging.createWithAutoCalculation({
                data,
                limit: 10,
                nextCursor: 'next',
                previousCursor: 'prev',
            });

            expect(cursorPaging.hasPreviousPage).toBe(true);
            expect(cursorPaging.previousCursor).toBe('prev');
        });

        it('should handle all optional cursors', () => {
            const data = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

            const cursorPaging = CursorPaging.createWithAutoCalculation({
                currentPage: 2,
                data,
                firstCursor: 'first',
                lastCursor: 'last',
                limit: 10,
                nextCursor: 'next',
                previousCursor: 'prev',
                total: 100,
            });

            expect(cursorPaging.firstCursor).toBe('first');
            expect(cursorPaging.lastCursor).toBe('last');
            expect(cursorPaging.currentPage).toBe(2);
        });

        it('should calculate totalPages when total is provided', () => {
            const data = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

            const cursorPaging = CursorPaging.createWithAutoCalculation({
                data,
                limit: 10,
                nextCursor: 'next',
                total: 95,
            });

            expect(cursorPaging.totalPages).toBe(10);
        });

        it('should set totalPages to null when total is not provided', () => {
            const data = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

            const cursorPaging = CursorPaging.createWithAutoCalculation({
                data,
                limit: 10,
                nextCursor: 'next',
            });

            expect(cursorPaging.totalPages).toBeNull();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty data', () => {
            const cursorPaging = CursorPaging.createWithAutoCalculation({
                data: [],
                limit: 10,
                nextCursor: null,
            });

            expect(cursorPaging.hasNextPage).toBe(false);
            expect(cursorPaging.currentPageSize).toBe(0);
        });

        it('should handle exactly limit items', () => {
            const data = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

            const cursorPaging = CursorPaging.createWithAutoCalculation({
                data,
                limit: 10,
                nextCursor: null,
            });

            expect(cursorPaging.hasNextPage).toBe(false);
            expect(cursorPaging.currentPageSize).toBe(10);
        });

        it('should handle one more than limit (has next page)', () => {
            const data = Array.from({ length: 11 }, (_, i) => ({ id: i + 1 }));

            const cursorPaging = CursorPaging.createWithAutoCalculation({
                data,
                limit: 10,
                nextCursor: 'next',
            });

            expect(cursorPaging.hasNextPage).toBe(true);
            expect(cursorPaging.currentPageSize).toBe(10);
        });
    });
});

describe('ApiCursorPaginatedResponseData', () => {
    describe('Constructor', () => {
        it('should create an ApiCursorPaginatedResponseData instance', () => {
            const cursorPaging = new CursorPaging({
                hasNextPage: true,
                nextCursor: 'eyJpZCI6MTF9',
            });
            const data = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));

            const response = new ApiCursorPaginatedResponseData({
                cursorPaging,
                data,
            });

            expect(response.data).toEqual(data);
            expect(response.cursorPaging).toBe(cursorPaging);
            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('Success');
        });

        it('should accept custom statusCode and message', () => {
            const cursorPaging = new CursorPaging({
                hasNextPage: false,
                nextCursor: null,
            });
            const data = [{ id: 1, name: 'User 1' }];

            const response = new ApiCursorPaginatedResponseData({
                cursorPaging,
                data,
                message: 'Users retrieved successfully',
                statusCode: 201,
            });

            expect(response.statusCode).toBe(201);
            expect(response.message).toBe('Users retrieved successfully');
        });

        it('should handle empty data array', () => {
            const cursorPaging = new CursorPaging({
                hasNextPage: false,
                nextCursor: null,
            });

            const response = new ApiCursorPaginatedResponseData({
                cursorPaging,
                data: [],
            });

            expect(response.data).toEqual([]);
        });
    });

    describe('Static create method', () => {
        it('should create an ApiCursorPaginatedResponseData instance', () => {
            const cursorPaging = new CursorPaging({
                hasNextPage: true,
                nextCursor: 'next',
            });
            const data = [
                { id: 1, name: 'User 1' },
                { id: 2, name: 'User 2' },
            ];

            const response = ApiCursorPaginatedResponseData.create(data, cursorPaging);

            expect(response).toBeInstanceOf(ApiCursorPaginatedResponseData);
            expect(response.data).toEqual(data);
            expect(response.cursorPaging).toBe(cursorPaging);
        });

        it('should accept custom message and statusCode', () => {
            const cursorPaging = new CursorPaging({
                hasNextPage: false,
                nextCursor: null,
            });
            const data = [{ id: 1, name: 'User 1' }];

            const response = ApiCursorPaginatedResponseData.create(data, cursorPaging, 'Custom message', 201);

            expect(response.message).toBe('Custom message');
            expect(response.statusCode).toBe(201);
        });
    });

    describe('Static createWithAutoCursors method', () => {
        it('should create response with auto-calculated cursors', () => {
            const data = Array.from({ length: 11 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));

            const response = ApiCursorPaginatedResponseData.createWithAutoCursors({
                data,
                limit: 10,
                nextCursor: 'eyJpZCI6MTF9',
                total: 100,
            });

            expect(response.data).toHaveLength(10); // Should slice to limit
            expect(response.cursorPaging.hasNextPage).toBe(true);
            expect(response.cursorPaging.currentPageSize).toBe(10);
            expect(response.cursorPaging.nextCursor).toBe('eyJpZCI6MTF9');
        });

        it('should accept custom message and statusCode', () => {
            const data = [{ id: 1, name: 'User 1' }];

            const response = ApiCursorPaginatedResponseData.createWithAutoCursors({
                data,
                limit: 10,
                message: 'Custom success',
                nextCursor: null,
                statusCode: 201,
            });

            expect(response.message).toBe('Custom success');
            expect(response.statusCode).toBe(201);
        });

        it('should handle last page correctly', () => {
            const data = Array.from({ length: 5 }, (_, i) => ({ id: i + 91, name: `User ${i + 91}` }));

            const response = ApiCursorPaginatedResponseData.createWithAutoCursors({
                data,
                limit: 10,
                nextCursor: null,
                previousCursor: 'prev',
                total: 95,
            });

            expect(response.data).toHaveLength(5);
            expect(response.cursorPaging.hasNextPage).toBe(false);
            expect(response.cursorPaging.hasPreviousPage).toBe(true);
        });

        it('should handle all cursor options', () => {
            const data = Array.from({ length: 10 }, (_, i) => ({ id: i + 11, name: `User ${i + 11}` }));

            const response = ApiCursorPaginatedResponseData.createWithAutoCursors({
                currentPage: 2,
                data,
                firstCursor: 'first',
                lastCursor: 'last',
                limit: 10,
                nextCursor: 'next',
                previousCursor: 'prev',
                total: 100,
            });

            expect(response.cursorPaging.firstCursor).toBe('first');
            expect(response.cursorPaging.lastCursor).toBe('last');
            expect(response.cursorPaging.previousCursor).toBe('prev');
            expect(response.cursorPaging.currentPage).toBe(2);
        });

        it('should slice data when hasNextPage is true', () => {
            const data = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }));

            const response = ApiCursorPaginatedResponseData.createWithAutoCursors({
                data,
                limit: 10,
                nextCursor: 'next',
            });

            expect(response.data).toHaveLength(10);
            expect(response.cursorPaging.hasNextPage).toBe(true);
        });

        it('should not slice data when hasNextPage is false', () => {
            const data = Array.from({ length: 5 }, (_, i) => ({ id: i + 1 }));

            const response = ApiCursorPaginatedResponseData.createWithAutoCursors({
                data,
                limit: 10,
                nextCursor: null,
            });

            expect(response.data).toHaveLength(5);
            expect(response.cursorPaging.hasNextPage).toBe(false);
        });
    });

    describe('Real-world Scenarios', () => {
        it('should handle infinite scroll pagination', () => {
            const posts = Array.from({ length: 11 }, (_, i) => ({
                id: i + 1,
                title: `Post ${i + 1}`,
                createdAt: new Date(Date.now() - i * 1000).toISOString(),
            }));

            const response = ApiCursorPaginatedResponseData.createWithAutoCursors({
                data: posts,
                limit: 10,
                message: 'Posts retrieved',
                nextCursor: 'eyJjcmVhdGVkQXQiOiIyMDI0LTAxLTAxVDEyOjAwOjAwLjAwMFoiLCJpZCI6MTF9',
            });

            expect(response.data).toHaveLength(10);
            expect(response.cursorPaging.hasNextPage).toBe(true);
        });

        it('should handle chat messages pagination', () => {
            const messages = Array.from({ length: 20 }, (_, i) => ({
                id: i + 1,
                content: `Message ${i + 1}`,
                timestamp: Date.now() - i * 1000,
            }));

            const response = ApiCursorPaginatedResponseData.createWithAutoCursors({
                data: messages,
                limit: 20,
                nextCursor: 'next-cursor',
                previousCursor: 'prev-cursor',
            });

            expect(response.data).toHaveLength(20);
            expect(response.cursorPaging.hasPreviousPage).toBe(true);
        });
    });
});

describe('ApiCursorPaginatedResponseDto', () => {
    it('should create a cursor paginated response DTO class', () => {
        const CursorPaginatedUserDto = ApiCursorPaginatedResponseDto(TestUserDto);

        expect(CursorPaginatedUserDto).toBeDefined();
        expect(CursorPaginatedUserDto.name).toBe('ApiCursorPaginatedResponseOfTestUserDto');
    });

    it('should create an instance of the DTO', () => {
        const CursorPaginatedUserDto = ApiCursorPaginatedResponseDto(TestUserDto);
        const instance = new CursorPaginatedUserDto();

        expect(instance).toBeInstanceOf(CursorPaginatedUserDto);
    });

    it('should have correct property structure', () => {
        const CursorPaginatedUserDto = ApiCursorPaginatedResponseDto(TestUserDto);
        const instance = new CursorPaginatedUserDto();

        instance.data = [{ id: 1, name: 'Test' }];
        instance.message = 'Success';
        instance.cursorPaging = new CursorPaging({ hasNextPage: false, nextCursor: null });
        instance.statusCode = 200;

        expect(instance.data).toEqual([{ id: 1, name: 'Test' }]);
        expect(instance.message).toBe('Success');
        expect(instance.cursorPaging).toBeInstanceOf(CursorPaging);
        expect(instance.statusCode).toBe(200);
    });

    it('should create unique class names for different types', () => {
        class PostDto {
            id!: number;
            title!: string;
        }

        const CursorPaginatedUserDto = ApiCursorPaginatedResponseDto(TestUserDto);
        const CursorPaginatedPostDto = ApiCursorPaginatedResponseDto(PostDto);

        expect(CursorPaginatedUserDto.name).toBe('ApiCursorPaginatedResponseOfTestUserDto');
        expect(CursorPaginatedPostDto.name).toBe('ApiCursorPaginatedResponseOfPostDto');
        expect(CursorPaginatedUserDto.name).not.toBe(CursorPaginatedPostDto.name);
    });
});
