import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsArray, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';

import { OrderDto } from './order.dto';

class BaseQueryDto {
    @ApiPropertyOptional({
        type: [OrderDto],
        description: 'Array of fields to sort by.',
    })
    @IsArray()
    @IsOptional()
    @Type(() => OrderDto)
    @ValidateNested({ each: true })
    order?: OrderDto[];

    @ApiPropertyOptional({
        type: [String],
        description: 'Array of field names to include in the response.',
        example: ['id', 'email', 'firstName', 'lastName'],
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    select?: string[];
}

export const createCustomQueryDto = (filterExample: Record<string, unknown>) => {
    class CustomQueryDto extends BaseQueryDto {
        @ApiProperty({
            type: 'object',
            additionalProperties: true,
            description: 'JsonLogic rule for filtering records.',
            example: filterExample,
        })
        @IsObject()
        @IsOptional()
        filter?: Record<string, unknown>;
    }

    return CustomQueryDto;
};

export class QueryDto extends createCustomQueryDto({ and: [{ '==': [{ var: 'email' }, 'test@example.com'] }] }) {}
