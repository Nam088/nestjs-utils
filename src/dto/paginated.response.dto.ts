import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { Exclude, Expose } from 'class-transformer';

/**
 * Interface for Paging constructor options
 */
export interface PagingOptions {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
    currentPageSize?: number;
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
    firstPage?: number;
    lastPage?: number;
    offset?: number;
    startItem?: number;
    endItem?: number;
}

/**
 * Interface for Paging static method options
 */
export interface PagingCreateOptions {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
}

/**
 * Interface for Paging auto calculation options
 */
export interface PagingAutoCalculationOptions {
    page: number;
    limit: number;
    total: number;
    currentPageSize?: number;
}

@Exclude()
export class Paging {
    @Expose()
    @ApiProperty({ example: 1, description: 'Current page number' })
    page!: number;

    @Expose()
    @ApiProperty({ example: 10, description: 'Number of items per page' })
    limit!: number;

    @Expose()
    @ApiProperty({ example: 100, description: 'Total number of items' })
    total!: number;

    @Expose()
    @ApiProperty({ example: 10, description: 'Total number of pages' })
    totalPages!: number;

    @Expose()
    @ApiProperty({ example: 10, description: 'Number of items in current page', required: false })
    currentPageSize?: number;

    @Expose()
    @ApiProperty({ example: true, description: 'Indicates if there is a previous page', required: false })
    hasPreviousPage?: boolean;

    @Expose()
    @ApiProperty({ example: true, description: 'Indicates if there is a next page', required: false })
    hasNextPage?: boolean;

    @Expose()
    @ApiProperty({ example: 1, description: 'First page number', required: false })
    firstPage?: number;

    @Expose()
    @ApiProperty({ example: 10, description: 'Last page number', required: false })
    lastPage?: number;

    @Expose()
    @ApiProperty({ example: 0, description: 'Number of items to skip (offset)', required: false })
    offset?: number;

    @Expose()
    @ApiProperty({ example: 11, description: 'Starting item number in current page', required: false })
    startItem?: number;

    @Expose()
    @ApiProperty({ example: 20, description: 'Ending item number in current page', required: false })
    endItem?: number;

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
        const { page, limit, total, currentPageSize } = options;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const startItem = offset + 1;
        const endItem = Math.min(offset + limit, total);

        return new Paging({
            page,
            limit,
            total,
            totalPages,
            currentPageSize,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
            firstPage: 1,
            lastPage: totalPages,
            offset,
            startItem,
            endItem,
        });
    }
}

/**
 * Interface for the standardized paginated API response structure.
 * @template T The type of the data items in the array.
 */
export interface IApiPaginatedResponse<T> {
    statusCode: number;
    message: string;
    data: T[];
    paging: Paging;
}

/**
 * Interface for ApiPaginatedResponseData constructor options
 * @template T The type of the data items in the array.
 */
export interface ApiPaginatedResponseDataOptions<T> {
    data: T[];
    paging: Paging;
    message?: string;
    statusCode?: number;
}

/**
 * Interface for ApiPaginatedResponseData auto paging options
 */
export interface ApiPaginatedResponseDataAutoPagingOptions<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    message?: string;
    statusCode?: number;
}

/**
 * A concrete implementation class for creating standardized paginated API responses within services.
 * @template T The type of the data items in the array.
 */
export class ApiPaginatedResponseData<T> implements IApiPaginatedResponse<T> {
    statusCode: number;
    message: string;
    data: T[];
    paging: Paging;

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
        return new ApiPaginatedResponseData({ data, paging, message, statusCode });
    }

    /**
     * Helper method to create paginated response with automatic paging calculation
     */
    static createWithAutoPaging<T>(options: ApiPaginatedResponseDataAutoPagingOptions<T>): ApiPaginatedResponseData<T> {
        const { data, total, page, limit, message = 'Success', statusCode = 200 } = options;
        const paging = Paging.createWithAutoCalculation({ page, limit, total, currentPageSize: data.length });
        return new ApiPaginatedResponseData({ data, paging, message, statusCode });
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
        @ApiProperty({ example: 200, description: 'HTTP Status Code' })
        statusCode!: number;

        @ApiProperty({ example: 'Success', description: 'A descriptive message for the result.' })
        message!: string;

        @ApiProperty({ type: [itemType] })
        data!: T[];

        @ApiProperty({ type: () => Paging })
        paging!: Paging;
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
    nextCursor: string | null;
    hasNextPage: boolean;
    previousCursor?: string | null;
    firstCursor?: string | null;
    lastCursor?: string | null;
    hasPreviousPage?: boolean;
    currentPageSize?: number;
    total?: number | null;
    totalPages?: number | null;
    currentPage?: number | null;
}

/**
 * Interface for CursorPaging static method options
 */
export interface CursorPagingCreateOptions {
    nextCursor: string | null;
    hasNextPage: boolean;
}

/**
 * Interface for CursorPaging auto calculation options
 */
export interface CursorPagingAutoCalculationOptions {
    data: any[];
    limit: number;
    nextCursor?: string | null;
    previousCursor?: string | null;
    firstCursor?: string | null;
    lastCursor?: string | null;
    total?: number | null;
    currentPage?: number | null;
}

@Exclude()
export class CursorPaging {
    @Expose()
    @ApiProperty({
        example: 'eyJjcmVhdGVkQXQiOiIyMDI0LTAxLTAxVDEyOjAwOjAwLjAwMFoiLCJpZCI6ImFhYmJjYyJ9',
        description: 'The cursor pointing to the next page of results.',
        nullable: true,
    })
    nextCursor!: string | null;

    @Expose()
    @ApiProperty({ example: true, description: 'Indicates if there is a next page of results.' })
    hasNextPage!: boolean;

    @Expose()
    @ApiProperty({
        example: 'eyJjcmVhdGVkQXQiOiIyMDI0LTAxLTAxVDEyOjAwOjAwLjAwMFoiLCJpZCI6Inh4eHh4eHgifQ==',
        description: 'The cursor pointing to the previous page of results.',
        nullable: true,
        required: false,
    })
    previousCursor?: string | null;

    @Expose()
    @ApiProperty({
        example: 'eyJjcmVhdGVkQXQiOiIyMDI0LTAxLTAxVDEyOjAwOjAwLjAwMFoiLCJpZCI6ImFhYmJjYyJ9',
        description: 'The cursor pointing to the first page of results.',
        nullable: true,
        required: false,
    })
    firstCursor?: string | null;

    @Expose()
    @ApiProperty({
        example: 'eyJjcmVhdGVkQXQiOiIyMDI0LTEyLTMxVDIzOjU5OjU5LjAwMFoiLCJpZCI6Inp6enp6enoifQ==',
        description: 'The cursor pointing to the last page of results.',
        nullable: true,
        required: false,
    })
    lastCursor?: string | null;

    @Expose()
    @ApiProperty({ example: false, description: 'Indicates if there is a previous page of results.', required: false })
    hasPreviousPage?: boolean;

    @Expose()
    @ApiProperty({ example: 20, description: 'Number of items in current page', required: false })
    currentPageSize?: number;

    @Expose()
    @ApiProperty({ example: 1000, description: 'Total number of items (if available)', required: false })
    total?: number | null;

    @Expose()
    @ApiProperty({ example: 50, description: 'Total number of pages (if available)', required: false })
    totalPages?: number | null;

    @Expose()
    @ApiProperty({ example: 1, description: 'Current page number (if available)', required: false })
    currentPage?: number | null;

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
    static createWithAutoCalculation(options: CursorPagingAutoCalculationOptions): CursorPaging {
        const { data, limit, nextCursor, previousCursor, firstCursor, lastCursor, total, currentPage } = options;
        const hasNextPage = data.length > limit;
        const actualData = hasNextPage ? data.slice(0, limit) : data;
        const currentPageSize = actualData.length;

        return new CursorPaging({
            nextCursor: nextCursor ?? null,
            hasNextPage,
            previousCursor: previousCursor ?? null,
            firstCursor: firstCursor ?? null,
            lastCursor: lastCursor ?? null,
            hasPreviousPage: !!previousCursor,
            currentPageSize,
            total,
            totalPages: total ? Math.ceil(total / limit) : null,
            currentPage,
        });
    }
}

export interface IApiCursorPaginatedResponse<T> {
    statusCode: number;
    message: string;
    data: T[];
    cursorPaging: CursorPaging;
}

/**
 * Interface for ApiCursorPaginatedResponseData constructor options
 * @template T The type of the data items in the array.
 */
export interface ApiCursorPaginatedResponseDataOptions<T> {
    data: T[];
    cursorPaging: CursorPaging;
    message?: string;
    statusCode?: number;
}

/**
 * Interface for ApiCursorPaginatedResponseData auto cursors options
 */
export interface ApiCursorPaginatedResponseDataAutoCursorsOptions<T> {
    data: T[];
    limit: number;
    nextCursor?: string | null;
    previousCursor?: string | null;
    firstCursor?: string | null;
    lastCursor?: string | null;
    total?: number | null;
    currentPage?: number | null;
    message?: string;
    statusCode?: number;
}

/**
 * A concrete implementation class for creating standardized cursor paginated API responses within services.
 * @template T The type of the data items in the array.
 */
export class ApiCursorPaginatedResponseData<T> implements IApiCursorPaginatedResponse<T> {
    statusCode: number;
    message: string;
    data: T[];
    cursorPaging: CursorPaging;

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
        return new ApiCursorPaginatedResponseData({ data, cursorPaging, message, statusCode });
    }

    /**
     * Helper method to create cursor paginated response with automatic cursor calculation
     */
    static createWithAutoCursors<T>(
        options: ApiCursorPaginatedResponseDataAutoCursorsOptions<T>,
    ): ApiCursorPaginatedResponseData<T> {
        const {
            data,
            limit,
            nextCursor,
            previousCursor,
            firstCursor,
            lastCursor,
            total,
            currentPage,
            message = 'Success',
            statusCode = 200,
        } = options;

        const cursorPaging = CursorPaging.createWithAutoCalculation({
            data: data as any[],
            limit,
            nextCursor,
            previousCursor,
            firstCursor,
            lastCursor,
            total,
            currentPage,
        });

        const actualData = cursorPaging.hasNextPage ? data.slice(0, limit) : data;

        return new ApiCursorPaginatedResponseData({
            data: actualData,
            cursorPaging,
            message,
            statusCode,
        });
    }
}

export const ApiCursorPaginatedResponseDto = <T>(itemType: Type<T>) => {
    class CursorPaginatedResponse implements IApiCursorPaginatedResponse<T> {
        @ApiProperty({ example: 200 })
        statusCode!: number;
        @ApiProperty({ example: 'Success' })
        message!: string;
        @ApiProperty({ type: [itemType] })
        data!: T[];
        @ApiProperty({ type: () => CursorPaging })
        cursorPaging!: CursorPaging;
    }
    Object.defineProperty(CursorPaginatedResponse, 'name', { value: `ApiCursorPaginatedResponseOf${itemType.name}` });
    return CursorPaginatedResponse;
};
