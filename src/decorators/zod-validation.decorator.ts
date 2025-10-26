import { Body, Param, Query } from '@nestjs/common';

import type { ZodType } from 'zod';

import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

/**
 * Helper function for validating request body with Zod schema
 * Returns Body decorator with ZodValidationPipe
 *
 * @example
 * ```typescript
 * @Post()
 * async create(@ZodBody(createUserSchema) dto: CreateUserDto) {
 *   return this.service.create(dto);
 * }
 * ```
 */
export const ZodBody = (schema: ZodType) => Body(new ZodValidationPipe(schema));

/**
 * Helper function for validating route params with Zod schema
 * Returns Param decorator with ZodValidationPipe
 *
 * @example
 * ```typescript
 * @Get(':id')
 * async findOne(@ZodParam(idParamSchema) params: IdParamDto) {
 *   return this.service.findOne(params.id);
 * }
 * ```
 */
export const ZodParam = (schema: ZodType) => Param(new ZodValidationPipe(schema));

/**
 * Helper function for validating query params with Zod schema
 * Returns Query decorator with ZodValidationPipe
 *
 * @example
 * ```typescript
 * @Get()
 * async findAll(@ZodQuery(queryUserSchema) query: QueryUserDto) {
 *   return this.service.findAll(query);
 * }
 * ```
 */
export const ZodQuery = (schema: ZodType) => Query(new ZodValidationPipe(schema));
