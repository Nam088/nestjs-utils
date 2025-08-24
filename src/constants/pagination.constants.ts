/**
 * Pagination type constants for API response formats.
 * @example
 * const paginationType = PAGINATION_TYPE.OFFSET; // 'offset'
 */
export const PAGINATION_TYPE = {
    CURSOR: 'cursor',
    OFFSET: 'offset',
} as const;

/**
 * Union type representing all supported pagination types.
 * @example
 * const handlePagination = (type: PaginationType) => {
 *   if (type === PAGINATION_TYPE.CURSOR) {
 *     return 'Cursor-based pagination';
 *   }
 *   return 'Offset-based pagination';
 * };
 */
export type PaginationType = (typeof PAGINATION_TYPE)[keyof typeof PAGINATION_TYPE];
