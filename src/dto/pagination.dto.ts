import { ApiPropertyOptional } from '@nestjs/swagger';

/** Minimum allowed limit value */
const MIN_LIMIT = 1;
/** Maximum allowed limit value */
const MAX_LIMIT = 100;

/**
 * Data Transfer Object for pagination parameters.
 * Provides standardized pagination with limit, page, and search functionality.
 * Use with Zod schema for validation.
 */
export class PaginationDto {
    /**
     * Number of items per page.
     * @default 10
     */
    @ApiPropertyOptional({ 
        type: Number, 
        default: 10, 
        minimum: MIN_LIMIT,
        maximum: MAX_LIMIT,
        description: 'Number of items per page' 
    })
    limit? = 10;

    /**
     * Page number (1-based).
     * @default 1
     */
    @ApiPropertyOptional({ 
        type: Number, 
        default: 1, 
        minimum: 1,
        description: 'Page number' 
    })
    page? = 1;

    /**
     * Search query string for filtering results.
     */
    @ApiPropertyOptional({ description: 'Search query string', example: 'Myriad Pro' })
    q?: string;
}

