/* eslint-disable security/detect-non-literal-regexp */
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
import { applyDecorators } from '@nestjs/common';

import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';

import type { ValidationArguments, ValidationOptions } from 'class-validator';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsAlphanumeric,
    IsArray,
    IsBase64,
    IsBoolean,
    IsDate,
    IsDefined,
    IsEmail,
    IsEnum,
    IsHexColor,
    IsInt,
    IsIP,
    IsJSON,
    IsJWT,
    IsNumber,
    IsOptional,
    IsPhoneNumber,
    IsPositive,
    IsString,
    IsUrl,
    IsUUID,
    Max,
    MaxLength,
    Min,
    MinLength,
    NotEquals,
    registerDecorator,
    ValidateIf,
    ValidateNested,
} from 'class-validator';

import { Transform, Type } from 'class-transformer';

import {
    get,
    isArray,
    isEmpty,
    isFunction,
    isNil,
    isNumber,
    isString,
    merge,
    omit,
    set,
    toLower,
    toUpper,
} from 'lodash';

import type { Constructor } from '../types';

/**
 * Transform decorator that converts values to boolean.
 * @param {ValidationOptions} options - Optional validation options
 * @returns {PropertyDecorator} Transform decorator
 * @example
 * class MyDto {
 *   @ToBoolean()
 *   isActive: boolean;
 * }
 */
export const ToBoolean = (options?: ValidationOptions): PropertyDecorator =>
    Transform(({ value }): boolean => {
        if (value === 'true' || value === true) return true;

        if (value === 'false' || value === false) return false;

        return value as boolean;
    }, options);

/**
 * Transform decorator that converts string values to lowercase.
 * @param {ValidationOptions} options - Optional validation options
 * @returns {PropertyDecorator} Transform decorator
 * @example
 * class MyDto {
 *   @ToLowerCase()
 *   username: string;
 * }
 */
export const ToLowerCase = (options?: ValidationOptions): PropertyDecorator =>
    Transform(({ value }): string => (isString(value) ? toLower(value) : (value as string)), options);

/**
 * Transform decorator that converts string values to uppercase.
 * @param {ValidationOptions} options - Optional validation options
 * @returns {PropertyDecorator} Transform decorator
 * @example
 * class MyDto {
 *   @ToUpperCase()
 *   countryCode: string;
 * }
 */
export const ToUpperCase = (options?: ValidationOptions): PropertyDecorator =>
    Transform(({ value }): string => (isString(value) ? toUpper(value) : (value as string)), options);

/**
 * Validation decorator that allows null values.
 * @param {ValidationOptions} options - Optional validation options
 * @returns {PropertyDecorator} Validation decorator
 * @example
 * class MyDto {
 *   @IsNullable()
 *   optionalField: string | null;
 * }
 */
export const IsNullable = (options?: ValidationOptions): PropertyDecorator =>
    ValidateIf((_obj, value) => value !== null, options);

/**
 * Custom password validation decorator with pattern matching.
 * @param {RegExp | string} pattern - Optional regex pattern for password validation
 * @param {ValidationOptions} validationOptions - Optional validation options
 * @returns {PropertyDecorator} Custom validation decorator
 * @example
 * class UserDto {
 *   @IsPassword(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: 'Password too weak' })
 *   password: string;
 * }
 */
export const IsPassword =
    (pattern?: RegExp | string, validationOptions?: ValidationOptions): PropertyDecorator =>
    (object, propertyName) => {
        let regex: RegExp;

        if (pattern) {
            regex = isString(pattern) ? new RegExp(pattern) : pattern;
        } else {
            regex = /^[\d!#$%&*@A-Z^a-z]*$/;
        }

        registerDecorator({
            name: 'isPassword',
            constraints: [regex],
            options: validationOptions,
            propertyName: propertyName as string,
            target: object.constructor,
            validator: {
                defaultMessage(validationArguments?: ValidationArguments): string {
                    if (!validationArguments) return '$property must match pattern';

                    const [regexPattern] = validationArguments.constraints as RegExp[];

                    return `$property must match pattern: ${regexPattern}`;
                },
                validate(value: string, validationArguments?: ValidationArguments): boolean {
                    if (!validationArguments) return false;

                    const [regexPattern] = validationArguments.constraints as RegExp[];

                    return regexPattern.test(value);
                },
            },
        });
    };

// Enhanced interfaces with better flexibility
interface IArrayFieldOptions extends IFieldOptions {
    maxSize?: number;
    messages?: {
        [key: string]: string | undefined;
        invalid?: string;
        maxSize?: string;
        minSize?: string;
        required?: string;
        uniqueItems?: string;
    };
    minSize?: number;
    uniqueItems?: boolean;
}

type IBooleanFieldOptions = IFieldOptions;

type IClassFieldOptions = IFieldOptions;

interface IDateFieldOptions extends IFieldOptions {
    maxDate?: Date;
    messages?: {
        [key: string]: string | undefined;
        invalid?: string;
        maxDate?: string;
        minDate?: string;
        required?: string;
    };
    minDate?: Date;
}

interface IEnumFieldOptions extends IFieldOptions {
    enumName?: string;
}

interface IFieldOptions {
    each?: boolean;
    groups?: string[];
    message?: ((validationArguments: ValidationArguments) => string) | string;
    messages?: {
        [key: string]: string | undefined;
        invalid?: string;
        nullable?: string;
        required?: string;
    };
    nullable?: boolean;
    required?: boolean;
    swagger?: boolean;
    transform?: (value: unknown) => unknown;
    validationOptions?: ValidationOptions;
    // Allow custom validation decorators
    customValidators?: PropertyDecorator[];
    // Allow custom transform decorators
    customTransforms?: PropertyDecorator[];
    // Skip default validations
    skipDefaultValidation?: boolean;
}

interface IFileFieldOptions extends IFieldOptions {
    maxFiles?: number;
    maxSize?: number; // in bytes
    mimeTypes?: string[];
}

interface IGeoFieldOptions extends IFieldOptions {
    latitude?: boolean;
    longitude?: boolean;
}

interface INumberFieldOptions extends IFieldOptions {
    allowInfinity?: boolean;
    allowNaN?: boolean;
    int?: boolean;
    isPositive?: boolean;
    max?: number;
    messages?: {
        [key: string]: string | undefined;
        int?: string;
        invalid?: string;
        max?: string;
        min?: string;
        positive?: string;
        required?: string;
    };
    min?: number;
}
interface IStringFieldOptions extends IFieldOptions {
    format?: 'alphanumeric' | 'base64' | 'email' | 'hexColor' | 'ip' | 'json' | 'phone' | 'url' | 'uuid';
    maxLength?: number;
    messages?: {
        [key: string]: string | undefined;
        email?: string;
        format?: string;
        invalid?: string;
        maxLength?: string;
        minLength?: string;
        pattern?: string;
        phone?: string;
        required?: string;
        url?: string;
        uuid?: string;
    };
    minLength?: number;
    pattern?: RegExp;
    skipLengthValidation?: boolean;
    toLowerCase?: boolean;
    toUpperCase?: boolean;
    trim?: boolean;
}
type ITokenFieldOptions = IFieldOptions;

/**
 * Conditionally adds a decorator to the decorators array based on a condition.
 * @param {PropertyDecorator[]} decorators - Array of decorators to add to
 * @param {unknown} condition - Condition to evaluate
 * @param {PropertyDecorator} decorator - Decorator to add if condition is truthy
 */
export const addConditionalDecorator = (
    decorators: PropertyDecorator[],
    condition: unknown,
    decorator: PropertyDecorator,
): void => {
    if (!isNil(condition) && condition !== false) {
        decorators.push(decorator);
    }
};

/**
 * Creates validation options with proper message handling and priority.
 * @param {IFieldOptions} options - Field options containing messages and validation settings
 * @param {string} messageKey - Optional key to look up the message in messages object
 * @param {string} defaultMessage - Optional default message if no custom message found
 * @returns {ValidationOptions} Validation options with message and settings
 */
export const createValidationOptions = (
    options: IFieldOptions,
    messageKey?: string,
    defaultMessage?: string,
): ValidationOptions => {
    const validationOptions = get(options, 'validationOptions', {}) as ValidationOptions;
    const each = get(options, 'each', false);

    let message: string | undefined = defaultMessage;

    // Priority: specific message > messages object > general message > validationOptions.message > default
    if (messageKey && options.messages && get(options.messages, messageKey)) {
        message = get(options.messages, messageKey);
    } else if (options.message) {
        message = isFunction(options.message) ? undefined : options.message;
    } else if (validationOptions.message) {
        message = validationOptions.message as string;
    }

    return {
        each,
        groups: options.groups,
        message,
        ...validationOptions,
    };
};

/**
 * Helper function to add custom decorators to the decorators array.
 * @param {PropertyDecorator[]} decorators - Array of decorators to add to
 * @param {IFieldOptions} options - Field options containing custom validators and transforms
 */
export const addCustomDecorators = (decorators: PropertyDecorator[], options: IFieldOptions): void => {
    if (options.customValidators) {
        decorators.push(...options.customValidators);
    }

    if (options.customTransforms) {
        decorators.push(...options.customTransforms);
    }
};

/**
 * Handles nullable and required validation for fields.
 * @param {PropertyDecorator[]} decorators - Array of decorators to add to
 * @param {IFieldOptions} options - Field options containing nullable and required settings
 */
export const handleNullableAndRequired = (decorators: PropertyDecorator[], options: IFieldOptions): void => {
    if (get(options, 'nullable', false)) {
        const nullableOptions = createValidationOptions(options, 'nullable', '$property cannot be null');

        decorators.push(IsNullable(nullableOptions));
    } else {
        const notNullOptions = createValidationOptions(options, 'required', '$property should not be null');

        decorators.push(NotEquals(null, notNullOptions));
    }
};

/**
 * Adds Swagger API property decorator with appropriate options.
 * @param {PropertyDecorator[]} decorators - Array of decorators to add to
 * @param {Record<string, unknown>} options - Options for the API property
 * @param {unknown} defaultType - Default type for the API property
 * @param {object} additionalProps - Additional properties to merge into the API options
 */
export const addSwaggerDecorator = (
    decorators: PropertyDecorator[],
    options: Record<string, unknown>,
    defaultType: unknown,
    additionalProps: object = {},
): void => {
    if (get(options, 'swagger', true) !== false) {
        const required = get(options, 'required', true);
        const swaggerOptions = omit(options, [
            'swagger',
            'each',
            'nullable',
            'required',
            'transform',
            'validationOptions',
            'minLength',
            'maxLength',
            'toLowerCase',
            'toUpperCase',
            'trim',
            'pattern',
            'format',
            'min',
            'max',
            'int',
            'isPositive',
            'allowInfinity',
            'allowNaN',
            'minSize',
            'maxSize',
            'uniqueItems',
            'minDate',
            'maxDate',
        ]);

        const apiPropertyOptions: ApiPropertyOptions = merge(
            {
                type: defaultType,
                required: !!required,
            },
            additionalProps,
            swaggerOptions,
        ) as ApiPropertyOptions;

        decorators.push(ApiProperty(apiPropertyOptions));
    }
};

/**
 * Adds transform decorator if transform function is provided.
 * @param {PropertyDecorator[]} decorators - Array of decorators to add to
 * @param {IFieldOptions} options - Field options containing transform function
 */
export const addTransformDecorator = (decorators: PropertyDecorator[], options: IFieldOptions): void => {
    if (isFunction(options.transform)) {
        decorators.push(Transform(({ value }): unknown => options.transform!(value)));
    }
};

/**
 * Enhanced number field decorator with comprehensive validation options.
 * @param {INumberFieldOptions & Omit<ApiPropertyOptions, 'type'>} options - Number field configuration options
 * @returns {PropertyDecorator} Combined decorator for number validation
 * @example
 * class ProductDto {
 *   @NumberField({ min: 0, max: 1000, int: true })
 *   price: number;
 * }
 */
export const NumberField = (
    options: INumberFieldOptions & Omit<ApiPropertyOptions, 'type'> = {},
): PropertyDecorator => {
    const decorators = [Type(() => Number)];

    // Add custom decorators first
    addCustomDecorators(decorators, options);

    if (!get(options, 'skipDefaultValidation', false)) {
        handleNullableAndRequired(decorators, options);
        addTransformDecorator(decorators, options);

        // Enhanced number validation
        const numberOptions = {
            allowInfinity: get(options, 'allowInfinity', false),
            allowNaN: get(options, 'allowNaN', false),
        };

        if (get(options, 'int', false)) {
            const intOptions = createValidationOptions(options, 'int', '$property must be an integer number');

            decorators.push(IsInt(intOptions));
        } else {
            const numberValidationOptions = createValidationOptions(options, 'invalid', '$property must be a number');

            decorators.push(IsNumber(numberOptions, numberValidationOptions));
        }

        if (!isNil(options.min)) {
            const minOptions = createValidationOptions(
                options,
                'min',
                `$property must not be less than ${options.min}`,
            );

            decorators.push(Min(options.min, minOptions));
        }

        if (!isNil(options.max)) {
            const maxOptions = createValidationOptions(
                options,
                'max',
                `$property must not be greater than ${options.max}`,
            );

            decorators.push(Max(options.max, maxOptions));
        }

        if (get(options, 'isPositive', false)) {
            const positiveOptions = createValidationOptions(options, 'positive', '$property must be a positive number');

            decorators.push(IsPositive(positiveOptions));
        }
    }

    addSwaggerDecorator(decorators, options as Record<string, unknown>, Number);

    return applyDecorators(...decorators);
};

/**
 * Optional number field decorator that automatically adds IsOptional.
 * @param {INumberFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'>} options - Number field options
 * @returns {PropertyDecorator} Combined decorator for optional number validation
 * @example
 * class UserDto {
 *   @NumberFieldOptional({ min: 18, max: 120 })
 *   age?: number;
 * }
 */
export const NumberFieldOptional = (
    options: INumberFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), NumberField(mergedOptions));
};

/**
 * Enhanced string field decorator with comprehensive validation and transformation options.
 * @param {IStringFieldOptions & Omit<ApiPropertyOptions, 'type'>} options - String field configuration options
 * @returns {PropertyDecorator} Combined decorator for string validation
 * @example
 * class UserDto {
 *   @StringField({ minLength: 2, maxLength: 50, trim: true })
 *   name: string;
 * }
 */
export const StringField = (
    options: IStringFieldOptions & Omit<ApiPropertyOptions, 'type'> = {},
): PropertyDecorator => {
    const decorators = [Type(() => String)];

    // Add custom decorators first
    addCustomDecorators(decorators, options);

    if (!get(options, 'skipDefaultValidation', false)) {
        const stringOptions = createValidationOptions(options, 'invalid', '$property must be a string');

        decorators.push(IsString(stringOptions));

        handleNullableAndRequired(decorators, options);
        addTransformDecorator(decorators, options);

        // Enhanced string transformations
        if (get(options, 'trim', true)) {
            decorators.push(Transform(({ value }): string => (isString(value) ? value.trim() : (value as string))));
        }

        addConditionalDecorator(decorators, options.toLowerCase, ToLowerCase());
        addConditionalDecorator(decorators, options.toUpperCase, ToUpperCase());

        // Length validation - only add if not explicitly disabled
        if (!get(options, 'skipLengthValidation', false)) {
            const minLength = get(options, 'minLength', 1);
            const minLengthOptions = createValidationOptions(
                options,
                'minLength',
                `$property must be longer than or equal to ${minLength} characters`,
            );

            decorators.push(MinLength(minLength, minLengthOptions));

            if (!isNil(options.maxLength)) {
                const maxLengthOptions = createValidationOptions(
                    options,
                    'maxLength',
                    `$property must be shorter than or equal to ${options.maxLength} characters`,
                );

                decorators.push(MaxLength(options.maxLength, maxLengthOptions));
            }
        }

        // Pattern validation
        if (options.pattern) {
            const patternOptions = createValidationOptions(
                options,
                'pattern',
                '$property must match the required pattern',
            );

            decorators.push(
                Transform(({ value }): string => {
                    if (isString(value) && options.pattern && !options.pattern.test(value)) {
                        throw new Error(
                            (patternOptions.message as string) || `${value} does not match pattern ${options.pattern}`,
                        );
                    }

                    return value;
                }),
            );
        }

        // Format-specific validation
        const format = get(options, 'format');

        switch (format) {
            case 'alphanumeric': {
                const alphanumericOptions = createValidationOptions(
                    options,
                    'format',
                    '$property must contain only letters and numbers',
                );

                decorators.push(IsAlphanumeric(undefined, alphanumericOptions));
                break;
            }

            case 'base64': {
                const base64ValidationOptions = createValidationOptions(
                    options,
                    'format',
                    '$property must be a valid base64 string',
                );
                const base64Options = {
                    paddingRequired: true,
                    urlSafe: false,
                    ...base64ValidationOptions,
                };

                decorators.push(IsBase64(base64Options));
                break;
            }

            case 'email': {
                const emailOptions = createValidationOptions(options, 'email', '$property must be a valid email');

                decorators.push(IsEmail({}, emailOptions));
                break;
            }

            case 'hexColor': {
                const hexColorOptions = createValidationOptions(
                    options,
                    'format',
                    '$property must be a valid hex color',
                );

                decorators.push(IsHexColor(hexColorOptions));
                break;
            }

            case 'ip': {
                const ipOptions = createValidationOptions(options, 'format', '$property must be a valid IP address');

                decorators.push(IsIP(undefined, ipOptions));
                break;
            }

            case 'json': {
                const jsonOptions = createValidationOptions(options, 'format', '$property must be a valid JSON string');

                decorators.push(IsJSON(jsonOptions));
                break;
            }

            case 'phone': {
                const phoneOptions = createValidationOptions(
                    options,
                    'phone',
                    '$property must be a valid phone number',
                );

                decorators.push(IsPhoneNumber(undefined, phoneOptions));
                break;
            }

            case 'url': {
                const urlOptions = createValidationOptions(options, 'url', '$property must be a valid URL');

                decorators.push(IsUrl({}, urlOptions));
                break;
            }

            case 'uuid': {
                const uuidOptions = createValidationOptions(options, 'uuid', '$property must be a valid UUID');

                decorators.push(IsUUID('4', uuidOptions));
                break;
            }
        }
    }

    addSwaggerDecorator(decorators, options as Record<string, unknown>, String, {
        isArray: get(options, 'each', false),
    });

    return applyDecorators(...decorators);
};

/**
 * Optional string field decorator that automatically adds IsOptional.
 * @param {IStringFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'>} options - String field options
 * @returns {PropertyDecorator} Combined decorator for optional string validation
 * @example
 * class UserDto {
 *   @StringFieldOptional({ maxLength: 100 })
 *   bio?: string;
 * }
 */
export const StringFieldOptional = (
    options: IStringFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), StringField(mergedOptions));
};

/**
 * JWT token field decorator with automatic JWT validation.
 * @param {ITokenFieldOptions & Omit<ApiPropertyOptions, 'type'>} options - Token field configuration options
 * @returns {PropertyDecorator} Combined decorator for JWT token validation
 * @example
 * class AuthDto {
 *   @TokenField()
 *   accessToken: string;
 * }
 */
export const TokenField = (options: ITokenFieldOptions & Omit<ApiPropertyOptions, 'type'> = {}): PropertyDecorator => {
    const decorators = [Type(() => String)];
    const isEach = get(options, 'each', false);

    decorators.push(IsJWT({ each: isEach }));
    handleNullableAndRequired(decorators, options);

    addSwaggerDecorator(decorators, options as Record<string, unknown>, String, {
        isArray: isEach,
    });

    return applyDecorators(...decorators);
};

/**
 * Optional JWT token field decorator.
 * @param {ITokenFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'>} options - Token field options
 * @returns {PropertyDecorator} Combined decorator for optional JWT token validation
 * @example
 * class RequestDto {
 *   @TokenFieldOptional()
 *   refreshToken?: string;
 * }
 */
export const TokenFieldOptional = (
    options: ITokenFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), TokenField(mergedOptions));
};

/**
 * Password field decorator with pattern validation and minimum length.
 * @param {RegExp | string} pattern - Optional regex pattern for password validation
 * @param {IStringFieldOptions & Omit<ApiPropertyOptions, 'minLength' | 'type'>} options - Password field options
 * @returns {PropertyDecorator} Combined decorator for password validation
 * @example
 * class UserDto {
 *   @PasswordField(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { minLength: 8 })
 *   password: string;
 * }
 */
export const PasswordField = (
    pattern?: RegExp | string,
    options: IStringFieldOptions & Omit<ApiPropertyOptions, 'minLength' | 'type'> = {},
): PropertyDecorator => {
    const passwordOptions = merge({ minLength: 6 }, options);
    const decorators = [StringField(passwordOptions), IsPassword(pattern, get(options, 'validationOptions', {}))];

    handleNullableAndRequired(decorators, options);

    return applyDecorators(...decorators);
};

/**
 * Optional password field decorator.
 * @param {IStringFieldOptions & Omit<ApiPropertyOptions, 'minLength' | 'required' | 'type'>} options - Password field options
 * @returns {PropertyDecorator} Combined decorator for optional password validation
 * @example
 * class UpdateUserDto {
 *   @PasswordFieldOptional({ minLength: 8 })
 *   newPassword?: string;
 * }
 */
export const PasswordFieldOptional = (
    options: IStringFieldOptions & Omit<ApiPropertyOptions, 'minLength' | 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), PasswordField(undefined, mergedOptions));
};

export const BooleanField = (
    options: IBooleanFieldOptions & Omit<ApiPropertyOptions, 'type'> = {},
): PropertyDecorator => {
    const decorators = [ToBoolean(), IsBoolean()];

    handleNullableAndRequired(decorators, options);
    addSwaggerDecorator(decorators, options as Record<string, unknown>, Boolean);

    return applyDecorators(...decorators);
};

export const BooleanFieldOptional = (
    options: IBooleanFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), BooleanField(mergedOptions));
};

export const EmailField = (options: IStringFieldOptions & Omit<ApiPropertyOptions, 'type'> = {}): PropertyDecorator => {
    const emailOptions = merge({ toLowerCase: true }, options);
    const decorators = [IsEmail(), StringField(emailOptions)];

    handleNullableAndRequired(decorators, options);

    return applyDecorators(...decorators);
};

export const EmailFieldOptional = (
    options: IStringFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), EmailField(mergedOptions));
};

export const UUIDField = (
    options: IFieldOptions & Omit<ApiPropertyOptions, 'format' | 'isArray' | 'type'> = {},
): PropertyDecorator => {
    const decorators = [Type(() => String)];
    const isEach = get(options, 'each', false);

    decorators.push(IsUUID('4', { each: isEach }));
    handleNullableAndRequired(decorators, options);

    addSwaggerDecorator(decorators, options as Record<string, unknown>, isEach ? [String] : String, {
        format: 'uuid',
        isArray: isEach,
    });

    return applyDecorators(...decorators);
};

export const UUIDFieldOptional = (
    options: IFieldOptions & Omit<ApiPropertyOptions, 'isArray' | 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), UUIDField(mergedOptions));
};

export const URLField = (options: IStringFieldOptions & Omit<ApiPropertyOptions, 'type'> = {}): PropertyDecorator => {
    const decorators = [StringField(options)];
    const isEach = get(options, 'each', false);

    decorators.push(IsUrl({}, { each: isEach }));
    handleNullableAndRequired(decorators, options);

    return applyDecorators(...decorators);
};

export const URLFieldOptional = (
    options: IStringFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), URLField(mergedOptions));
};

// New ArrayField decorator
export const ArrayField = <_T>(
    itemType: () => Constructor,
    options: IArrayFieldOptions & Omit<ApiPropertyOptions, 'isArray' | 'type'> = {},
): PropertyDecorator => {
    const decorators = [Type(() => itemType()), IsArray(get(options, 'validationOptions', {}))];

    handleNullableAndRequired(decorators, options);
    addTransformDecorator(decorators, options);

    addSwaggerDecorator(decorators, options as Record<string, unknown>, [itemType()], {
        isArray: true,
    });

    addConditionalDecorator(
        decorators,
        options.minSize,
        ArrayMinSize(options.minSize!, get(options, 'validationOptions', {})),
    );

    addConditionalDecorator(
        decorators,
        options.maxSize,
        ArrayMaxSize(options.maxSize!, get(options, 'validationOptions', {})),
    );

    // Unique items validation
    if (get(options, 'uniqueItems', false)) {
        decorators.push(
            Transform(({ value }): unknown[] => {
                if (isArray(value)) {
                    return [...new Set(value)];
                }

                return value as unknown[];
            }),
        );
    }

    return applyDecorators(...decorators);
};

export const ArrayFieldOptional = <_T>(
    itemType: () => Constructor,
    options: IArrayFieldOptions & Omit<ApiPropertyOptions, 'isArray' | 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional(get(options, 'validationOptions', {})), ArrayField(itemType, mergedOptions));
};

// Enhanced DateField with min/max date validation
export const DateField = (options: IDateFieldOptions & Omit<ApiPropertyOptions, 'type'> = {}): PropertyDecorator => {
    const decorators = [Type(() => Date), IsDate(get(options, 'validationOptions', {}))];

    handleNullableAndRequired(decorators, options);
    addTransformDecorator(decorators, options);
    addSwaggerDecorator(decorators, options as Record<string, unknown>, Date);

    // Date range validation
    if (options.minDate) {
        decorators.push(
            Transform(({ value }): Date | undefined => {
                if (value instanceof Date && options.minDate) {
                    return value >= options.minDate ? value : undefined;
                }

                return value;
            }),
        );
    }

    if (options.maxDate) {
        decorators.push(
            Transform(({ value }): Date | undefined => {
                if (value instanceof Date && options.maxDate) {
                    return value <= options.maxDate ? value : undefined;
                }

                return value;
            }),
        );
    }

    return applyDecorators(...decorators);
};

export const DateFieldOptional = (
    options: IDateFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), DateField(mergedOptions));
};

export const EnumField = <TEnum extends object>(
    getEnum: () => TEnum,
    options: IEnumFieldOptions & Omit<ApiPropertyOptions, 'enum' | 'isArray' | 'type'> = {},
): PropertyDecorator => {
    const decorators = [];
    const isEach = get(options, 'each', false);

    if (isFunction(getEnum)) {
        decorators.push(IsEnum(getEnum(), { each: isEach }));
    }

    handleNullableAndRequired(decorators, options);

    if (get(options, 'swagger', true) !== false) {
        const enumName = get(options, 'enumName') || getVariableName(getEnum);

        addSwaggerDecorator(decorators, options as Record<string, unknown>, undefined, {
            enum: getEnum(),
            enumName,
            isArray: isEach,
        });
    }

    return applyDecorators(...decorators);
};

export const EnumFieldOptional = <TEnum extends object>(
    getEnum: () => TEnum,
    options: IEnumFieldOptions & Omit<ApiPropertyOptions, 'enum' | 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), EnumField(getEnum, mergedOptions));
};

export const ClassField = <TClass extends Constructor>(
    getClass: () => TClass,
    options: IClassFieldOptions & Omit<ApiPropertyOptions, 'type'> = {},
): PropertyDecorator => {
    const decorators = [];
    const isEach = get(options, 'each', false);

    if (isFunction(getClass)) {
        decorators.push(
            Type(() => getClass()),
            ValidateNested({ each: isEach }),
        );
    }

    const isRequired = get(options, 'required', true);

    if (isRequired) {
        decorators.push(IsDefined());
    }

    handleNullableAndRequired(decorators, options);

    addSwaggerDecorator(decorators, options as Record<string, unknown>, () => getClass());

    return applyDecorators(...decorators);
};

export const ClassFieldOptional = <TClass extends Constructor>(
    getClass: () => TClass,
    options: IClassFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), ClassField(getClass, mergedOptions));
};

// Phone number field
export const PhoneField = (
    country?: string,
    options: IStringFieldOptions & Omit<ApiPropertyOptions, 'type'> = {},
): PropertyDecorator => {
    const decorators = [Type(() => String), IsPhoneNumber(country as never, get(options, 'validationOptions', {}))];

    handleNullableAndRequired(decorators, options);
    addTransformDecorator(decorators, options);

    addSwaggerDecorator(decorators, options as Record<string, unknown>, String, {
        example: country === 'VN' ? '+84987654321' : '+1234567890',
    });

    return applyDecorators(...decorators);
};

export const PhoneFieldOptional = (
    country?: string,
    options: IStringFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional(get(options, 'validationOptions', {})), PhoneField(country, mergedOptions));
};

// JSON field
export const JsonField = (options: IStringFieldOptions & Omit<ApiPropertyOptions, 'type'> = {}): PropertyDecorator => {
    const decorators = [Type(() => String), IsJSON(get(options, 'validationOptions', {}))];

    handleNullableAndRequired(decorators, options);
    addTransformDecorator(decorators, options);
    addSwaggerDecorator(decorators, options as Record<string, unknown>, Object);

    return applyDecorators(...decorators);
};

export const JsonFieldOptional = (
    options: IStringFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional(get(options, 'validationOptions', {})), JsonField(mergedOptions));
};

// Utility decorator for conditional fields
export const ConditionalField =
    <T>(condition: (obj: T) => boolean, fieldDecorator: PropertyDecorator): PropertyDecorator =>
    (target: object, propertyKey: string | symbol) => {
        fieldDecorator(target, propertyKey);

        // Add conditional validation logic
        Transform(({ obj }): unknown => {
            if (!condition(obj as T)) {
                return undefined;
            }

            return get(obj as Record<string | symbol, unknown>, propertyKey);
        })(target, propertyKey);
    };

/**
 * Safely extracts variable name from a function reference with enhanced error handling.
 * @param {() => unknown} variableFunction - Function that returns the variable
 * @returns {string} Extracted variable name or 'UnknownEnum' if extraction fails
 * @example
 * enum UserRole { ADMIN, USER }
 * const name = getVariableName(() => UserRole); // 'UserRole'
 */
export const getVariableName = (variableFunction: () => unknown): string => {
    try {
        if (!isFunction(variableFunction)) {
            return 'UnknownEnum';
        }

        const functionString = variableFunction.toString();

        // Handle arrow functions and regular functions
        let name = '';

        if (functionString.includes('=>')) {
            // Arrow function: () => MyEnum
            const match = functionString.match(/=>\s*(\w+)/);

            name = match ? match[1] : '';
        } else {
            // Regular function
            const parts = functionString.split('.');

            name = parts.pop() || '';
        }

        return isEmpty(name) ? 'UnknownEnum' : name;
    } catch {
        return 'UnknownEnum';
    }
};

/**
 * Creates a custom validator decorator with specified validation logic.
 * @param {string} validatorName - Name of the validator
 * @param {(value: unknown, args?: unknown[]) => boolean} validationFunction - Function that validates the value
 * @param {string} defaultMessage - Optional default error message
 * @param {unknown[]} constraints - Optional validation constraints
 * @returns {PropertyDecorator} Custom validator decorator
 * @example
 * const IsEven = createCustomValidator(
 *   'isEven',
 *   (value: number) => value % 2 === 0,
 *   'Value must be even'
 * );
 */
export const createCustomValidator =
    (
        validatorName: string,
        validationFunction: (value: unknown, args?: unknown[]) => boolean,
        defaultMessage?: string,
        constraints?: unknown[],
    ): PropertyDecorator =>
    (object: object, propertyName: string | symbol) => {
        registerDecorator({
            name: validatorName,
            constraints: constraints || [],
            options: { message: defaultMessage || `$property failed ${validatorName} validation` },
            propertyName: propertyName as string,
            target: (object as { constructor: new (...args: unknown[]) => unknown }).constructor,
            validator: {
                validate(value: unknown, args?: ValidationArguments): boolean {
                    return validationFunction(value, args?.constraints as unknown[]);
                },
            },
        });
    };

/**
 * Creates a custom transform decorator with specified transformation logic.
 * @param {(value: unknown) => unknown} transformFunction - Function that transforms the value
 * @param {ValidationOptions} options - Optional validation options
 * @returns {PropertyDecorator} Custom transform decorator
 * @example
 * const TrimAndLowercase = createCustomTransform((value: string) => 
 *   value.trim().toLowerCase()
 * );
 */
export const createCustomTransform = (
    transformFunction: (value: unknown) => unknown,
    options?: ValidationOptions,
): PropertyDecorator => Transform(({ value }) => transformFunction(value), options);

// Flexible field factory
export const createFlexibleField =
    (
        baseType: () => new (...args: unknown[]) => unknown,
        defaultValidators: PropertyDecorator[] = [],
        defaultOptions: Partial<IFieldOptions> = {},
    ) =>
    (options: IFieldOptions & Omit<ApiPropertyOptions, 'type'> = {}) => {
        const mergedOptions = merge(defaultOptions, options);
        const decorators = [Type(baseType)];

        // Add custom decorators first
        addCustomDecorators(decorators, mergedOptions);

        // Add default validators if not skipped
        if (!get(mergedOptions, 'skipDefaultValidation', false)) {
            decorators.push(...defaultValidators);
            handleNullableAndRequired(decorators, mergedOptions);
            addTransformDecorator(decorators, mergedOptions);
        }

        addSwaggerDecorator(decorators, mergedOptions as Record<string, unknown>, baseType());

        return applyDecorators(...decorators);
    };

// Message builder utility
export const buildValidationMessage = (template: string, replacements: Record<string, unknown> = {}): string =>
    Object.entries(replacements).reduce(
        (message, [key, value]) => message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
        template,
    );

/**
 * Validation rule builder for creating custom field decorators with fluent API.
 * Provides a flexible way to build complex validation rules.
 */
export class ValidationRuleBuilder {
    /** Array of decorators to apply */
    private decorators: PropertyDecorator[] = [];
    /** Field options configuration */
    private options: IFieldOptions = {};

    /**
     * Adds a transform decorator to the builder.
     * @param {PropertyDecorator} transform - Transform decorator to add
     * @returns {ValidationRuleBuilder} Builder instance for chaining
     * @example
     * ValidationRuleBuilder.create()
     *   .addTransform(Transform(({ value }) => value.trim()))
     */
    addTransform(transform: PropertyDecorator): this {
        this.decorators.push(transform);

        return this;
    }

    /**
     * Adds a validator decorator to the builder.
     * @param {PropertyDecorator} validator - Validator decorator to add
     * @returns {ValidationRuleBuilder} Builder instance for chaining
     * @example
     * ValidationRuleBuilder.create()
     *   .addValidator(IsEmail())
     */
    addValidator(validator: PropertyDecorator): this {
        this.decorators.push(validator);

        return this;
    }

    /**
     * Builds and returns the decorators and options.
     * @returns {object} Object containing decorators array and options
     */
    build(): { decorators: PropertyDecorator[]; options: IFieldOptions } {
        return {
            decorators: [...this.decorators],
            options: { ...this.options },
        };
    }

    /**
     * Creates a new ValidationRuleBuilder instance.
     * @returns {ValidationRuleBuilder} New builder instance
     * @example
     * const builder = ValidationRuleBuilder.create();
     */
    static create(): ValidationRuleBuilder {
        return new ValidationRuleBuilder();
    }

    /**
     * Sets a validation message for a specific key.
     * @param {string} key - Message key
     * @param {string} message - Validation message
     * @returns {ValidationRuleBuilder} Builder instance for chaining
     * @example
     * builder.setMessage('required', 'This field is required');
     */
    setMessage(key: string, message: string): this {
        if (!this.options.messages) {
            this.options.messages = {};
        }

        set(this.options.messages, key, message);

        return this;
    }

    /**
     * Sets an option value for the field.
     * @template K - Key type
     * @param {K} key - Option key
     * @param {IFieldOptions[K]} value - Option value
     * @returns {ValidationRuleBuilder} Builder instance for chaining
     * @example
     * builder.setOption('required', false);
     */
    setOption<K extends keyof IFieldOptions>(key: K, value: IFieldOptions[K]): this {
        set(this.options, key, value);

        return this;
    }

    /**
     * Applies all decorators and returns the combined decorator.
     * @returns {PropertyDecorator} Combined property decorator
     * @example
     * class MyDto {
     *   @ValidationRuleBuilder.create()
     *     .addValidator(IsString())
     *     .setMessage('required', 'Name is required')
     *     .apply()
     *   name: string;
     * }
     */
    apply(): PropertyDecorator {
        const { decorators } = this.build();

        return applyDecorators(...decorators);
    }
}

/**
 * Utility object containing helper functions for field validation and decoration.
 * Provides access to internal utility functions for advanced field customization.
 * @example
 * const customField = FieldUtils.createFlexibleField(String, {
 *   validators: [IsString()],
 *   transforms: [Transform(({ value }) => value.trim())]
 * });
 */
export const FieldUtils = {
    addConditionalDecorator,
    addCustomDecorators,
    addSwaggerDecorator,
    addTransformDecorator,
    buildValidationMessage,
    createCustomTransform,
    createCustomValidator,
    createFlexibleField,
    createValidationOptions,
    getVariableName,
    handleNullableAndRequired,
    ValidationRuleBuilder,
};

// File validation decorator
export const FileField = (options: IFileFieldOptions & Omit<ApiPropertyOptions, 'type'> = {}): PropertyDecorator => {
    const decorators = [Type(() => String)];

    // File size validation
    if (options.maxSize) {
        decorators.push(
            Transform(({ value }): { size: number } => {
                if (value && (value as { size: number }).size > options.maxSize!) {
                    throw new Error(`File size exceeds ${options.maxSize} bytes`);
                }

                return value as { size: number };
            }),
        );
    }

    // MIME type validation
    if (options.mimeTypes && options.mimeTypes.length > 0) {
        decorators.push(
            Transform(({ value }): { mimetype: string } => {
                if (value && !options.mimeTypes!.includes((value as { mimetype: string }).mimetype)) {
                    throw new Error(`Invalid file type. Allowed: ${options.mimeTypes!.join(', ')}`);
                }

                return value as { mimetype: string };
            }),
        );
    }

    handleNullableAndRequired(decorators, options);
    addSwaggerDecorator(decorators, options as Record<string, unknown>, 'string', {
        type: 'file',
        format: 'binary',
    });

    return applyDecorators(...decorators);
};

export const FileFieldOptional = (
    options: IFileFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), FileField(mergedOptions));
};

// Geographic coordinates validation
export const GeoField = (options: IGeoFieldOptions & Omit<ApiPropertyOptions, 'type'> = {}): PropertyDecorator => {
    const decorators = [Type(() => Number)];

    // Latitude validation (-90 to 90)
    if (options.latitude) {
        decorators.push(
            Transform(({ value }): number => {
                if (isNumber(value) && (value < -90 || value > 90)) {
                    throw new Error('Latitude must be between -90 and 90');
                }

                return value as number;
            }),
        );
    }

    // Longitude validation (-180 to 180)
    if (options.longitude) {
        decorators.push(
            Transform(({ value }): number => {
                if (isNumber(value) && (value < -180 || value > 180)) {
                    throw new Error('Longitude must be between -180 and 180');
                }

                return value as number;
            }),
        );
    }

    handleNullableAndRequired(decorators, options);
    addSwaggerDecorator(decorators, options as Record<string, unknown>, Number);

    return applyDecorators(...decorators);
};

export const GeoFieldOptional = (
    options: IGeoFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), GeoField(mergedOptions));
};

// Credit card validation
export const CreditCardField = (
    options: IStringFieldOptions & Omit<ApiPropertyOptions, 'type'> = {},
): PropertyDecorator => {
    const decorators = [Type(() => String)];

    // Luhn algorithm for credit card validation
    decorators.push(
        Transform(({ value }): string => {
            if (isString(value)) {
                const digits = value.replace(/\D/g, '');

                if (digits.length < 13 || digits.length > 19) {
                    throw new Error('Invalid credit card number length');
                }

                // Luhn algorithm
                let sum = 0;
                let isEven = false;

                for (let i = digits.length - 1; i >= 0; i--) {
                    let digit = parseInt(get(digits, i));

                    if (isEven) {
                        digit *= 2;

                        if (digit > 9) digit -= 9;
                    }

                    sum += digit;
                    isEven = !isEven;
                }

                if (sum % 10 !== 0) {
                    throw new Error('Invalid credit card number');
                }
            }

            return value as string;
        }),
    );

    handleNullableAndRequired(decorators, options);
    addSwaggerDecorator(decorators, options as Record<string, unknown>, String, {
        description: 'Credit card number (will be validated using Luhn algorithm)',
        example: '4111111111111111',
    });

    return applyDecorators(...decorators);
};

export const CreditCardFieldOptional = (
    options: IStringFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), CreditCardField(mergedOptions));
};

// Currency field with validation
export const CurrencyField = (
    options: INumberFieldOptions & Omit<ApiPropertyOptions, 'type'> = {},
): PropertyDecorator => {
    const decorators = [Type(() => Number)];

    // Currency validation (positive number with 2 decimal places)
    decorators.push(
        Transform(({ value }): number => {
            if (isNumber(value)) {
                if (value < 0) {
                    throw new Error('Currency amount cannot be negative');
                }

                // Round to 2 decimal places
                return Math.round(value * 100) / 100;
            }

            return value as number;
        }),
    );

    handleNullableAndRequired(decorators, options);
    addSwaggerDecorator(decorators, options as Record<string, unknown>, Number, {
        description: 'Currency amount (will be rounded to 2 decimal places)',
        example: 99.99,
    });

    return applyDecorators(...decorators);
};

export const CurrencyFieldOptional = (
    options: INumberFieldOptions & Omit<ApiPropertyOptions, 'required' | 'type'> = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);

    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), CurrencyField(mergedOptions));
};

// ==================== USAGE EXAMPLES ====================

/*
// Example 1: Custom validator with flexible message
export class UserDto {
    @StringField({
        customValidators: [
            FieldUtils.createCustomValidator(
                'isStrongPassword',
                (value: string) => {
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value);
                },
                'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
            )
        ],
        messages: {
            required: 'Mật khẩu là bắt buộc',
            minLength: 'Mật khẩu phải có ít nhất {minLength} ký tự'
        },
        minLength: 8
    })
    password: string;
}

// Example 2: Using ValidationRuleBuilder
export class ProductDto {
    @FieldUtils.ValidationRuleBuilder
        .create()
        .addValidator(IsString())
        .addValidator(MinLength(3))
        .addTransform(Transform(({ value }) => value?.trim()))
        .setMessage('required', 'Tên sản phẩm không được để trống')
        .setMessage('minLength', 'Tên sản phẩm phải có ít nhất 3 ký tự')
        .apply()
    name: string;
}

// Example 3: Skip default validation and use only custom ones
export class CustomDto {
    @StringField({
        skipDefaultValidation: true,
        customValidators: [
            IsString({ message: 'Phải là chuỗi ký tự' }),
            MinLength(5, { message: 'Tối thiểu 5 ký tự' })
        ]
    })
    customField: string;
}

// Example 4: Flexible field factory
const EmailField = FieldUtils.createFlexibleField(
    () => String,
    [IsEmail({ message: 'Email không hợp lệ' })],
    { toLowerCase: true, trim: true }
);

export class ContactDto {
    @EmailField({
        messages: {
            required: 'Email là bắt buộc'
        }
    })
    email: string;
}

// Example 5: Complex validation with multiple custom rules
export class AdvancedDto {
    @NumberField({
        customValidators: [
            FieldUtils.createCustomValidator(
                'isEvenNumber',
                (value: number) => value % 2 === 0,
                'Số phải là số chẵn'
            ),
            FieldUtils.createCustomValidator(
                'isDivisibleBy',
                (value: number, constraints: number[]) => {
                    const divisor = constraints?.[0] || 1;
                    return value % divisor === 0;
                },
                'Số phải chia hết cho {divisor}',
                [5] // constraints
            )
        ],
        customTransforms: [
            FieldUtils.createCustomTransform((value: number) => Math.abs(value))
        ],
        messages: {
            required: 'Số là bắt buộc',
            invalid: 'Phải là một số hợp lệ'
        }
    })
    evenNumber: number;
}

// Example 6: Conditional validation
export class ConditionalDto {
    @BooleanField()
    hasAddress: boolean;

    @ConditionalField(
        (obj: ConditionalDto) => obj.hasAddress,
        StringField({
            messages: {
                required: 'Địa chỉ là bắt buộc khi hasAddress = true'
            }
        })
    )
    address?: string;
}
*/
