import { Type } from '@nestjs/common';

import { ApiProperty } from '@nestjs/swagger';

import { Exclude, Expose } from 'class-transformer';

/**
 * Interface for Paging constructor options
 */
export interface PagingOptions {
    currentPageSize?: number;
    endItem?: number;
    firstPage?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    lastPage?: number;
    limit: number;
    offset?: number;
    page: number;
    startItem?: number;
    total: number;
    totalPages?: number;
}

/**
 * Interface for Paging static method options
 */
export interface PagingCreateOptions {
    limit: number;
    page: number;
    total: number;
    totalPages?: number;
}

/**
 * Interface for Paging auto calculation options
 */
export interface PagingAutoCalculationOptions {
    currentPageSize?: number;
    limit: number;
    page: number;
    total: number;
}

@Exclude()
export class Paging {
    @ApiProperty({ description: 'Number of items in current page', example: 10, required: false })
    @Expose()
    currentPageSize?: number;

    @ApiProperty({ description: 'Ending item number in current page', example: 20, required: false })
    @Expose()
    endItem?: number;

    @ApiProperty({ description: 'First page number', example: 1, required: false })
    @Expose()
    firstPage?: number;

    @ApiProperty({ description: 'Indicates if there is a next page', example: true, required: false })
    @Expose()
    hasNextPage?: boolean;

    @ApiProperty({ description: 'Indicates if there is a previous page', example: true, required: false })
    @Expose()
    hasPreviousPage?: boolean;

    @ApiProperty({ description: 'Last page number', example: 10, required: false })
    @Expose()
    lastPage?: number;

    @ApiProperty({ description: 'Number of items per page', example: 10 })
    @Expose()
    limit!: number;

    @ApiProperty({ description: 'Number of items to skip (offset)', example: 0, required: false })
    @Expose()
    offset?: number;

    @ApiProperty({ description: 'Current page number', example: 1 })
    @Expose()
    page!: number;

    @ApiProperty({ description: 'Starting item number in current page', example: 11, required: false })
    @Expose()
    startItem?: number;

    @ApiProperty({ description: 'Total number of items', example: 100 })
    @Expose()
    total!: number;

    @ApiProperty({ description: 'Total number of pages', example: 10 })
    @Expose()
    totalPages!: number;

    constructor(options: PagingOptions) {
        this.page = options.page;
        this.limit = options.limit;
        this.total = options.total;
        this.totalPages = options.totalPages ?? Math.ceil(options.total / options.limit);
        this.currentPageSize = options.currentPageSize;
        this.hasPreviousPage = options.hasPreviousPage ?? options.page > 1;
        this.hasNextPage = options.hasNextPage ?? options.page < this.totalPages;
        this.firstPage = options.firstPage ?? 1;
        this.lastPage = options.lastPage ?? this.totalPages;
        this.offset = options.offset ?? (options.page - 1) * options.limit;
        this.startItem = options.startItem ?? this.offset + 1;
        this.endItem = options.endItem ?? Math.min(this.offset + options.limit, options.total);
    }

    /**
     * Static factory method for backward compatibility
     * @deprecated Use constructor with object parameter instead
     */
    static create(options: PagingCreateOptions): Paging {
        return new Paging(options);
    }

    /**
     * Helper method to create paging with automatic calculation
     */
    static createWithAutoCalculation(options: PagingAutoCalculationOptions): Paging {
        const { currentPageSize, limit, page, total } = options;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const startItem = offset + 1;
        const endItem = Math.min(offset + limit, total);

        return new Paging({
            currentPageSize,
            endItem,
            firstPage: 1,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
            lastPage: totalPages,
            limit,
            offset,
            page,
            startItem,
            total,
            totalPages,
        });
    }
}

/**
 * Interface for the standardized paginated API response structure.
 * @template T The type of the data items in the array.
 */
export interface IApiPaginatedResponse<T> {
    data: T[];
    message: string;
    paging: Paging;
    statusCode: number;
}

/**
 * Interface for ApiPaginatedResponseData constructor options
 * @template T The type of the data items in the array.
 */
export interface ApiPaginatedResponseDataOptions<T> {
    data: T[];
    message?: string;
    paging: Paging;
    statusCode?: number;
}

/**
 * Interface for ApiPaginatedResponseData auto paging options
 */
export interface ApiPaginatedResponseDataAutoPagingOptions<T> {
    data: T[];
    limit: number;
    message?: string;
    page: number;
    statusCode?: number;
    total: number;
}

/**
 * A concrete implementation class for creating standardized paginated API responses within services.
 * @template T The type of the data items in the array.
 */
export class ApiPaginatedResponseData<T> implements IApiPaginatedResponse<T> {
    data: T[];
    message: string;
    paging: Paging;
    statusCode: number;

    constructor(options: ApiPaginatedResponseDataOptions<T>) {
        this.statusCode = options.statusCode ?? 200;
        this.message = options.message ?? 'Success';
        this.data = options.data;
        this.paging = options.paging;
    }

    /**
     * Static factory method for backward compatibility
     * @deprecated Use constructor with object parameter instead
     */
    static create<T>(data: T[], paging: Paging, message = 'Success', statusCode = 200): ApiPaginatedResponseData<T> {
        return new ApiPaginatedResponseData({ data, message, paging, statusCode });
    }

    /**
     * Helper method to create paginated response with automatic paging calculation
     */
    static createWithAutoPaging<T>(options: ApiPaginatedResponseDataAutoPagingOptions<T>): ApiPaginatedResponseData<T> {
        const { data, limit, message = 'Success', page, statusCode = 200, total } = options;
        const paging = Paging.createWithAutoCalculation({ currentPageSize: data.length, limit, page, total });

        return new ApiPaginatedResponseData({ data, message, paging, statusCode });
    }
}

/**
 * A factory function to create a class for Swagger documentation of standardized paginated API responses.
 * @template T The type of the data items in the array.
 * @param itemType The class or type of the items in the data array.
 * @returns {Type<IApiPaginatedResponse<T>>} The class definition of the API paginated response.
 */
export const ApiPaginatedResponseDto = <T>(itemType: Type<T>) => {
    class PaginatedResponse implements IApiPaginatedResponse<T> {
        @ApiProperty({ type: [itemType] })
        data!: T[];

        @ApiProperty({ description: 'A descriptive message for the result.', example: 'Success' })
        message!: string;

        @ApiProperty({ type: () => Paging })
        paging!: Paging;

        @ApiProperty({ description: 'HTTP Status Code', example: 200 })
        statusCode!: number;
    }

    // Give the dynamically generated class a unique name for Swagger to avoid conflicts.
    Object.defineProperty(PaginatedResponse, 'name', {
        value: `ApiPaginatedResponseOf${itemType.name}`,
    });

    return PaginatedResponse;
};

// --- Cursor Pagination ---

/**
 * Interface for CursorPaging constructor options
 */
export interface CursorPagingOptions {
    currentPage?: null | number;
    currentPageSize?: number;
    firstCursor?: null | string;
    hasNextPage: boolean;
    hasPreviousPage?: boolean;
    lastCursor?: null | string;
    nextCursor: null | string;
    previousCursor?: null | string;
    total?: null | number;
    totalPages?: null | number;
}

/**
 * Interface for CursorPaging static method options
 */
export interface CursorPagingCreateOptions {
    hasNextPage: boolean;
    nextCursor: null | string;
}

/**
 * Interface for CursorPaging auto calculation options
 */
export interface CursorPagingAutoCalculationOptions<T> {
    currentPage?: null | number;
    data: T[];
    firstCursor?: null | string;
    lastCursor?: null | string;
    limit: number;
    nextCursor?: null | string;
    previousCursor?: null | string;
    total?: null | number;
}

@Exclude()
export class CursorPaging {
    @ApiProperty({ description: 'Current page number (if available)', example: 1, required: false })
    @Expose()
    currentPage?: null | number;

    @ApiProperty({ description: 'Number of items in current page', example: 20, required: false })
    @Expose()
    currentPageSize?: number;

    @ApiProperty({
        description: 'The cursor pointing to the first page of results.',
        example: 'eyJjcmVhdGVkQXQiOiIyMDI0LTAxLTAxVDEyOjAwOjAwLjAwMFoiLCJpZCI6ImFhYmJjYyJ9',
        nullable: true,
        required: false,
    })
    @Expose()
    firstCursor?: null | string;

    @ApiProperty({ description: 'Indicates if there is a next page of results.', example: true })
    @Expose()
    hasNextPage!: boolean;

    @ApiProperty({ description: 'Indicates if there is a previous page of results.', example: false, required: false })
    @Expose()
    hasPreviousPage?: boolean;

    @ApiProperty({
        description: 'The cursor pointing to the last page of results.',
        example: 'eyJjcmVhdGVkQXQiOiIyMDI0LTEyLTMxVDIzOjU5OjU5LjAwMFoiLCJpZCI6Inp6enp6enoifQ==',
        nullable: true,
        required: false,
    })
    @Expose()
    lastCursor?: null | string;

    @ApiProperty({
        description: 'The cursor pointing to the next page of results.',
        example: 'eyJjcmVhdGVkQXQiOiIyMDI0LTAxLTAxVDEyOjAwOjAwLjAwMFoiLCJpZCI6ImFhYmJjYyJ9',
        nullable: true,
    })
    @Expose()
    nextCursor!: null | string;

    @ApiProperty({
        description: 'The cursor pointing to the previous page of results.',
        example: 'eyJjcmVhdGVkQXQiOiIyMDI0LTAxLTAxVDEyOjAwOjAwLjAwMFoiLCJpZCI6Inh4eHh4eHgifQ==',
        nullable: true,
        required: false,
    })
    @Expose()
    previousCursor?: null | string;

    @ApiProperty({ description: 'Total number of items (if available)', example: 1000, required: false })
    @Expose()
    total?: null | number;

    @ApiProperty({ description: 'Total number of pages (if available)', example: 50, required: false })
    @Expose()
    totalPages?: null | number;

    constructor(options: CursorPagingOptions) {
        this.nextCursor = options.nextCursor;
        this.hasNextPage = options.hasNextPage;
        this.previousCursor = options.previousCursor;
        this.firstCursor = options.firstCursor;
        this.lastCursor = options.lastCursor;
        this.hasPreviousPage = options.hasPreviousPage ?? !!options.previousCursor;
        this.currentPageSize = options.currentPageSize;
        this.total = options.total;
        this.totalPages = options.totalPages;
        this.currentPage = options.currentPage;
    }

    /**
     * Static factory method for backward compatibility
     * @deprecated Use constructor with object parameter instead
     */
    static create(options: CursorPagingCreateOptions): CursorPaging {
        return new CursorPaging(options);
    }

    /**
     * Helper method to create cursor paging with automatic calculation
     */
    static createWithAutoCalculation<T>(options: CursorPagingAutoCalculationOptions<T>): CursorPaging {
        const { currentPage, data, firstCursor, lastCursor, limit, nextCursor, previousCursor, total } = options;
        const hasNextPage = data.length > limit;
        const actualData = hasNextPage ? data.slice(0, limit) : data;
        const currentPageSize = actualData.length;

        return new CursorPaging({
            currentPage,
            currentPageSize,
            firstCursor: firstCursor ?? null,
            hasNextPage,
            hasPreviousPage: !!previousCursor,
            lastCursor: lastCursor ?? null,
            nextCursor: nextCursor ?? null,
            previousCursor: previousCursor ?? null,
            total,
            totalPages: total ? Math.ceil(total / limit) : null,
        });
    }
}

export interface IApiCursorPaginatedResponse<T> {
    cursorPaging: CursorPaging;
    data: T[];
    message: string;
    statusCode: number;
}

/**
 * Interface for ApiCursorPaginatedResponseData constructor options
 * @template T The type of the data items in the array.
 */
export interface ApiCursorPaginatedResponseDataOptions<T> {
    cursorPaging: CursorPaging;
    data: T[];
    message?: string;
    statusCode?: number;
}

/**
 * Interface for ApiCursorPaginatedResponseData auto cursors options
 */
export interface ApiCursorPaginatedResponseDataAutoCursorsOptions<T> {
    currentPage?: null | number;
    data: T[];
    firstCursor?: null | string;
    lastCursor?: null | string;
    limit: number;
    message?: string;
    nextCursor?: null | string;
    previousCursor?: null | string;
    statusCode?: number;
    total?: null | number;
}

/**
 * A concrete implementation class for creating standardized cursor paginated API responses within services.
 * @template T The type of the data items in the array.
 */
export class ApiCursorPaginatedResponseData<T> implements IApiCursorPaginatedResponse<T> {
    cursorPaging: CursorPaging;
    data: T[];
    message: string;
    statusCode: number;

    constructor(options: ApiCursorPaginatedResponseDataOptions<T>) {
        this.statusCode = options.statusCode ?? 200;
        this.message = options.message ?? 'Success';
        this.data = options.data;
        this.cursorPaging = options.cursorPaging;
    }

    /**
     * Static factory method for backward compatibility
     * @deprecated Use constructor with object parameter instead
     */
    static create<T>(
        data: T[],
        cursorPaging: CursorPaging,
        message = 'Success',
        statusCode = 200,
    ): ApiCursorPaginatedResponseData<T> {
        return new ApiCursorPaginatedResponseData({ cursorPaging, data, message, statusCode });
    }

    /**
     * Helper method to create cursor paginated response with automatic cursor calculation
     */
    static createWithAutoCursors<T>(
        options: ApiCursorPaginatedResponseDataAutoCursorsOptions<T>,
    ): ApiCursorPaginatedResponseData<T> {
        const {
            currentPage,
            data,
            firstCursor,
            lastCursor,
            limit,
            message = 'Success',
            nextCursor,
            previousCursor,
            statusCode = 200,
            total,
        } = options;

        const cursorPaging = CursorPaging.createWithAutoCalculation<T>({
            currentPage,
            data,
            firstCursor,
            lastCursor,
            limit,
            nextCursor,
            previousCursor,
            total,
        });

        const actualData = cursorPaging.hasNextPage ? data.slice(0, limit) : data;

        return new ApiCursorPaginatedResponseData({
            cursorPaging,
            data: actualData,
            message,
            statusCode,
        });
    }
}

export const ApiCursorPaginatedResponseDto = <T>(itemType: Type<T>) => {
    class CursorPaginatedResponse implements IApiCursorPaginatedResponse<T> {
        @ApiProperty({ type: () => CursorPaging })
        cursorPaging!: CursorPaging;

        @ApiProperty({ type: [itemType] })
        data!: T[];

        @ApiProperty({ example: 'Success' })
        message!: string;

        @ApiProperty({ example: 200 })
        statusCode!: number;
    }

    Object.defineProperty(CursorPaginatedResponse, 'name', { value: `ApiCursorPaginatedResponseOf${itemType.name}` });

    return CursorPaginatedResponse;
};
