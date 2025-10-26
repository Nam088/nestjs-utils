import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for ordering/sorting configuration.
 * Defines how results should be sorted by field and direction.
 * Use with Zod schema for validation.
 */
export class OrderDto {
    /**
     * Sort direction: 1 for ascending, -1 for descending.
     */
    @ApiProperty({ 
        description: 'Sort direction: 1 for ASC, -1 for DESC', 
        enum: [1, -1], 
        example: -1 
    })
    direction!: -1 | 1;

    /**
     * Field name to sort by.
     */
    @ApiProperty({ description: 'Field to sort by', example: 'createdAt' })
    field!: string;
}

