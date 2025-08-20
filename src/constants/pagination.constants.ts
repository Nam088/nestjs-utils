export const PAGINATION_TYPE = {
    CURSOR: 'cursor',
    OFFSET: 'offset',
} as const;

export type PaginationType = (typeof PAGINATION_TYPE)[keyof typeof PAGINATION_TYPE];
