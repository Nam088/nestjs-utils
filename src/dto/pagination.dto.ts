import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsInt, IsOptional, IsString, Min } from 'class-validator';

import { Type } from 'class-transformer';

import { ClampNumber } from '../decorators/clamp-number.decorator';

/** Minimum allowed limit value */
const MIN_LIMIT = 1;
/** Maximum allowed limit value */
const MAX_LIMIT = 100;

/**
 * Data Transfer Object for pagination parameters.
 * Provides standardized pagination with limit, page, and search functionality.
 */
export class PaginationDto {
    /**
     * Number of items per page.
     * @default 10
     */
    @ApiPropertyOptional({ type: Number, default: 10, description: 'Number of items per page' })
    @ClampNumber({ max: MAX_LIMIT, min: MIN_LIMIT })
    @IsInt()
    @IsOptional()
    limit? = 10;

    /**
     * Page number (1-based).
     * @default 1
     */
    @ApiPropertyOptional({ type: Number, default: 1, description: 'Page number' })
    @IsInt()
    @IsOptional()
    @Min(1)
    @Type(() => Number)
    page? = 1;

    /**
     * Search query string for filtering results.
     */
    @ApiPropertyOptional({ description: 'Search query string', example: 'Myriad Pro' })
    @IsOptional()
    @IsString()
    q?: string;
}
