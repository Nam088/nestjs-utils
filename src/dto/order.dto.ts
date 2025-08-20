import { ApiProperty } from '@nestjs/swagger';

import { IsIn, IsNumber, IsString } from 'class-validator';

import { Type } from 'class-transformer';

export class OrderDto {
    @ApiProperty({ description: 'Sort direction: 1 for ASC, -1 for DESC', enum: [1, -1], example: -1 })
    @IsIn([1, -1])
    @IsNumber()
    @Type(() => Number)
    direction!: -1 | 1;

    @ApiProperty({ description: 'Field to sort by', example: 'createdAt' })
    @IsString()
    field!: string;
}
