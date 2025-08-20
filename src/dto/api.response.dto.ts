import { Type } from '@nestjs/common';

import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';

/**
 * Interface for the standardized API response structure.
 * @template T The type of the data payload.
 */
export interface IApiResponse<T> {
    data: null | T; // Allow null for responses like delete
    message: string;
    statusCode: number;
}

/**
 * A factory function to create a class for Swagger documentation of standardized API responses.
 * This helps Swagger understand the generic `data` property.
 * @param dataType The class or type of the data payload. Pass null for empty data response.
 * @template T The type of the data payload.
 * @returns The class definition of the API response.
 */
export const ApiResponseDto = <T>(dataType: null | Type<T>): Type<IApiResponse<T>> => {
    // This function determines the correct options for the @ApiProperty decorator
    // based on whether a data type is provided.
    const getApiPropertyOptions = (): ApiPropertyOptions => {
        if (dataType) {
            // If we have a data type, specify it
            return { type: dataType, nullable: true };
        }

        // If data type is null, we just indicate it can be null and provide an example
        return { example: null, nullable: true };
    };

    class ApiResponse implements IApiResponse<T> {
        @ApiProperty(getApiPropertyOptions())
        data!: null | T;

        @ApiProperty({ description: 'A descriptive message for the result.', example: 'Success' })
        message!: string;

        @ApiProperty({ description: 'HTTP Status Code', example: 200 })
        statusCode!: number;
    }

    // Give the dynamically generated class a unique name for Swagger to avoid conflicts.
    const uniqueClassName = `ApiResponseOf${dataType ? dataType.name : 'Null'}`;

    Object.defineProperty(ApiResponse, 'name', { value: uniqueClassName });

    return ApiResponse;
};

/**
 * Interface for ApiResponseData constructor options
 * @template T The type of the data payload.
 */
export interface ApiResponseDataOptions<T> {
    data: T;
    message?: string;
    statusCode?: number;
}

/**
 * A concrete implementation class for creating standardized API responses within services.
 * @template T The type of the data payload.
 */
export class ApiResponseData<T> implements IApiResponse<T> {
    data: T;
    message: string;
    statusCode: number;

    constructor(options: ApiResponseDataOptions<T>) {
        this.statusCode = options.statusCode ?? 200;
        this.message = options.message ?? 'Success';
        this.data = options.data;
    }

    /**
     * Static factory method for backward compatibility
     * @deprecated Use constructor with object parameter instead
     */
    static create<T>(data: T, message = 'Success', statusCode = 200): ApiResponseData<T> {
        return new ApiResponseData({ data, message, statusCode });
    }
}
