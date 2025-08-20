import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsInt, IsOptional, IsString, Min } from 'class-validator';

import { Type } from 'class-transformer';

import { ClampNumber } from '../decorators/clamp-number.decorator';

const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

export class PaginationDto {
    @ApiPropertyOptional({ type: Number, default: 10, description: 'Number of items per page' })
    @ClampNumber({ max: MAX_LIMIT, min: MIN_LIMIT })
    @IsInt()
    @IsOptional()
    limit? = 10;

    @ApiPropertyOptional({ type: Number, default: 1, description: 'Page number' })
    @IsInt()
    @IsOptional()
    @Min(1)
    @Type(() => Number)
    page? = 1;

    @ApiPropertyOptional({ description: 'Search query string', example: 'Myriad Pro' })
    @IsOptional()
    @IsString()
    q?: string;
}
