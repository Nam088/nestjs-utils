/**
 * This file serves as the single source of truth for all query operators.
 * It defines user-friendly operator groups and a comprehensive map to
 * the actual operators used by json-logic and the database.
 */

import { invert, mapValues } from 'lodash';

// --- Operator Groups ---

export const STRING_OPERATORS = {
    CONTAINS: 'contains',
    ENDS_WITH: 'ends_with',
    EQUALS: 'equals',
    IN: 'in',
    IS_EMPTY: 'is_empty',
    IS_NOT_EMPTY: 'is_not_empty',
    IS_NOT_NULL: 'is_not_null',
    IS_NULL: 'is_null',
    LIKE: 'like',
    NOT_CONTAINS: 'not_contains',
    NOT_EQUALS: 'not_equals',
    NOT_IN: 'not_in',
    NOT_LIKE: 'not_like',
    STARTS_WITH: 'starts_with',
} as const;

export const NUMBER_OPERATORS = {
    BETWEEN: 'between',
    EQUALS: 'equals',
    GT: 'gt',
    GTE: 'gte',
    IS_NOT_NULL: 'is_not_null',
    IS_NULL: 'is_null',
    LT: 'lt',
    LTE: 'lte',
    NOT_BETWEEN: 'not_between',
    NOT_EQUALS: 'not_equals',
} as const;

export const DATE_OPERATORS = {
    BETWEEN: 'between',
    EQUALS: 'equals',
    GT: 'gt',
    GTE: 'gte',
    IS_NOT_NULL: 'is_not_null',
    IS_NULL: 'is_null',
    LT: 'lt',
    LTE: 'lte',
    NOT_EQUALS: 'not_equals',
} as const;

export const BOOLEAN_OPERATORS = {
    EQUALS: 'equals',
    IS_NOT_NULL: 'is_not_null',
    IS_NULL: 'is_null',
} as const;

export const ENUM_OPERATORS = {
    EQUALS: 'equals',
    IN: 'in',
    IS_NOT_NULL: 'is_not_null',
    IS_NULL: 'is_null',
    NOT_EQUALS: 'not_equals',
    NOT_IN: 'not_in',
} as const;

export const ARRAY_OPERATORS = {
    CONTAINS: 'array_contains', // For checking if a JSONB array contains a value
    OVERLAPS: 'array_overlaps',
} as const;

export const JSON_OPERATORS = {
    ARRAY_TEXT_CONTAINS: 'json_array_text_contains', // Custom op for searching text in a json array
    CONTAINS: 'json_contains',
    EQUALS: 'json_equals',
    IN: 'json_in',
} as const;

export const LOGIC_OPERATORS = {
    AND: 'and',
    IF: 'if',
    OR: 'or',
    TERNARY: '?:',
    VAR: 'var',
} as const;

/**
 * A comprehensive mapping from user-friendly operator names used in blueprint definitions
 * to their actual JSON Logic implementation and metadata. This is the single source of truth.
 */
export const ALL_OPERATORS_MAP: Record<string, { arity: number | number[]; op: string }> = {
    // --- Array & Set Operations ---
    [ARRAY_OPERATORS.CONTAINS]: { arity: 2, op: 'array_contains' },
    [ARRAY_OPERATORS.OVERLAPS]: { arity: 2, op: 'array_overlaps' },

    // --- JSONB Operations (Custom) ---
    [JSON_OPERATORS.ARRAY_TEXT_CONTAINS]: { arity: 2, op: 'json_array_text_contains' },
    [JSON_OPERATORS.CONTAINS]: { arity: 2, op: 'json_contains' },

    [JSON_OPERATORS.EQUALS]: { arity: 2, op: 'json_equals' },
    [JSON_OPERATORS.IN]: { arity: 2, op: 'json_in' },
    // --- Numeric Comparison ---
    [NUMBER_OPERATORS.BETWEEN]: { arity: 3, op: 'between' },
    [NUMBER_OPERATORS.GT]: { arity: 2, op: '>' },
    [NUMBER_OPERATORS.GTE]: { arity: 2, op: '>=' },
    [NUMBER_OPERATORS.LT]: { arity: 2, op: '<' },

    [NUMBER_OPERATORS.LTE]: { arity: 2, op: '<=' },
    [NUMBER_OPERATORS.NOT_BETWEEN]: { arity: 3, op: 'not_between' },
    // --- Strict Comparison ---
    strict_equals: { arity: 2, op: '===' },
    strict_not_equals: { arity: 2, op: '!==' },
    // --- Text Search ---
    [STRING_OPERATORS.CONTAINS]: { arity: 2, op: 'contains' },
    [STRING_OPERATORS.ENDS_WITH]: { arity: 2, op: 'ends_with' },

    // --- Standard Comparison ---
    [STRING_OPERATORS.EQUALS]: { arity: 2, op: '==' },
    [STRING_OPERATORS.IN]: { arity: 2, op: 'in' },
    // --- Null & Empty Checks ---
    [STRING_OPERATORS.IS_EMPTY]: { arity: 1, op: 'is_empty' },
    [STRING_OPERATORS.IS_NOT_EMPTY]: { arity: 1, op: 'is_not_empty' },

    [STRING_OPERATORS.IS_NOT_NULL]: { arity: 1, op: 'is_not_null' },
    [STRING_OPERATORS.IS_NULL]: { arity: 1, op: 'is_null' },
    [STRING_OPERATORS.LIKE]: { arity: 2, op: 'like' },
    [STRING_OPERATORS.NOT_CONTAINS]: { arity: 2, op: 'not_contains' },

    [STRING_OPERATORS.NOT_EQUALS]: { arity: 2, op: '!=' },
    [STRING_OPERATORS.NOT_IN]: { arity: 2, op: 'not_in' },
    [STRING_OPERATORS.NOT_LIKE]: { arity: 2, op: 'not_like' },
    [STRING_OPERATORS.STARTS_WITH]: { arity: 2, op: 'starts_with' },
};

/**
 * An inverted map to look up a friendly operator name from its logic implementation.
 * e.g., LOGIC_TO_FRIENDLY_MAP['=='] will return 'equals'.
 */
export const LOGIC_TO_FRIENDLY_MAP = invert(mapValues(ALL_OPERATORS_MAP, (v) => v.op));

/**
 * A set of operators whose names are the same in both blueprints and json-logic.
 */
export const NATIVE_OPERATORS = new Set([
    'contains',
    'in',
    // Add other operators that don't need mapping
]);
