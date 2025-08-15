import { applyDecorators } from '@nestjs/common';
import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';

import { Type, Transform } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsDefined,
    IsEmail,
    IsEnum,
    IsInt,
    IsJWT,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUrl,
    IsUUID,
    Max,
    MaxLength,
    Min,
    MinLength,
    NotEquals,
    ValidateNested,
    IsArray,
    ArrayMinSize,
    ArrayMaxSize,
    IsPhoneNumber,
    IsAlphanumeric,
    IsHexColor,
    IsIP,
    IsJSON,
    IsBase64,
    ValidationOptions,
    ValidateIf,
    registerDecorator,
    ValidationArguments,
} from 'class-validator';
import { isNil, omit, merge, get, isFunction, isArray, isEmpty, toLower, toUpper, isString, isNumber } from 'lodash';

import { Constructor } from '../types';

export const ToBoolean = (options?: ValidationOptions): PropertyDecorator =>
    Transform(({ value }): boolean => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value as boolean;
    }, options);

export const ToLowerCase = (options?: ValidationOptions): PropertyDecorator =>
    Transform(({ value }): string => (isString(value) ? toLower(value) : (value as string)), options);

export const ToUpperCase = (options?: ValidationOptions): PropertyDecorator =>
    Transform(({ value }): string => (isString(value) ? toUpper(value) : (value as string)), options);

export const IsNullable = (options?: ValidationOptions): PropertyDecorator =>
    ValidateIf((_obj, value) => value !== null, options);

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
            propertyName: propertyName as string,
            name: 'isPassword',
            target: object.constructor,
            constraints: [regex],
            options: validationOptions,
            validator: {
                validate(value: string, validationArguments?: ValidationArguments): boolean {
                    if (!validationArguments) return false;
                    const [regexPattern] = validationArguments.constraints as RegExp[];
                    return regexPattern.test(value);
                },
                defaultMessage(validationArguments?: ValidationArguments): string {
                    if (!validationArguments) return '$property must match pattern';
                    const [regexPattern] = validationArguments.constraints as RegExp[];
                    return `$property must match pattern: ${regexPattern}`;
                },
            },
        });
    };

// Enhanced interfaces
interface IFieldOptions {
    each?: boolean;
    swagger?: boolean;
    nullable?: boolean;
    groups?: string[];
    required?: boolean;
    transform?: (value: any) => any;
    validationOptions?: ValidationOptions;
}

interface IArrayFieldOptions extends IFieldOptions {
    minSize?: number;
    maxSize?: number;
    uniqueItems?: boolean;
}

interface INumberFieldOptions extends IFieldOptions {
    min?: number;
    max?: number;
    int?: boolean;
    isPositive?: boolean;
    allowInfinity?: boolean;
    allowNaN?: boolean;
}

interface IStringFieldOptions extends IFieldOptions {
    minLength?: number;
    maxLength?: number;
    toLowerCase?: boolean;
    toUpperCase?: boolean;
    trim?: boolean;
    pattern?: RegExp;
    format?: 'email' | 'url' | 'uuid' | 'phone' | 'alphanumeric' | 'hexColor' | 'ip' | 'json' | 'base64';
}

interface IEnumFieldOptions extends IFieldOptions {
    enumName?: string;
}

interface IDateFieldOptions extends IFieldOptions {
    minDate?: Date;
    maxDate?: Date;
}

interface IFileFieldOptions extends IFieldOptions {
    maxSize?: number; // in bytes
    mimeTypes?: string[];
    maxFiles?: number;
}

interface IGeoFieldOptions extends IFieldOptions {
    latitude?: boolean;
    longitude?: boolean;
}

type IBooleanFieldOptions = IFieldOptions;
type ITokenFieldOptions = IFieldOptions;
type IClassFieldOptions = IFieldOptions;

// Enhanced helper functions
export const addConditionalDecorator = (
    decorators: PropertyDecorator[],
    condition: unknown,
    decorator: PropertyDecorator,
): void => {
    if (!isNil(condition) && condition !== false) {
        decorators.push(decorator);
    }
};

export const handleNullableAndRequired = (decorators: PropertyDecorator[], options: IFieldOptions): void => {
    const validationOptions = get(options, 'validationOptions', {});
    const eachOption = { each: get(options, 'each', false), ...validationOptions };

    if (get(options, 'nullable', false)) {
        decorators.push(IsNullable(eachOption));
    } else {
        decorators.push(NotEquals(null, eachOption));
    }
};

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

export const addTransformDecorator = (decorators: PropertyDecorator[], options: IFieldOptions): void => {
    if (isFunction(options.transform)) {
        decorators.push(Transform(({ value }): unknown => options.transform!(value)));
    }
};

// Enhanced NumberField with more options
export const NumberField = (
    options: Omit<ApiPropertyOptions, 'type'> & INumberFieldOptions = {},
): PropertyDecorator => {
    const decorators = [Type(() => Number)];
    const validationOptions = merge({ each: get(options, 'each', false) }, get(options, 'validationOptions', {}));

    handleNullableAndRequired(decorators, options);
    addTransformDecorator(decorators, options);
    addSwaggerDecorator(decorators, options as Record<string, unknown>, Number);

    // Enhanced number validation
    const numberOptions = {
        allowNaN: get(options, 'allowNaN', false),
        allowInfinity: get(options, 'allowInfinity', false),
    };

    if (get(options, 'int', false)) {
        decorators.push(IsInt(validationOptions));
    } else {
        decorators.push(IsNumber(numberOptions, validationOptions));
    }

    addConditionalDecorator(decorators, options.min, Min(options.min!, validationOptions));

    addConditionalDecorator(decorators, options.max, Max(options.max!, validationOptions));

    addConditionalDecorator(decorators, options.isPositive, IsPositive(validationOptions));

    return applyDecorators(...decorators);
};

export const NumberFieldOptional = (
    options: Omit<ApiPropertyOptions, 'type' | 'required'> & INumberFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), NumberField(mergedOptions));
};

// Enhanced StringField with format validation
export const StringField = (
    options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator => {
    const decorators = [Type(() => String)];
    const validationOptions = merge({ each: get(options, 'each', false) }, get(options, 'validationOptions', {}));

    decorators.push(IsString(validationOptions));
    handleNullableAndRequired(decorators, options);
    addTransformDecorator(decorators, options);

    addSwaggerDecorator(decorators, options as Record<string, unknown>, String, {
        isArray: get(options, 'each', false),
    });

    // Enhanced string transformations
    if (get(options, 'trim', true)) {
        decorators.push(Transform(({ value }): string => (isString(value) ? value.trim() : (value as string))));
    }

    addConditionalDecorator(decorators, options.toLowerCase, ToLowerCase());
    addConditionalDecorator(decorators, options.toUpperCase, ToUpperCase());

    // Length validation
    const minLength = get(options, 'minLength', 1);
    decorators.push(MinLength(minLength, validationOptions));

    addConditionalDecorator(decorators, options.maxLength, MaxLength(options.maxLength!, validationOptions));

    // Pattern validation
    addConditionalDecorator(
        decorators,
        options.pattern,
        Transform(({ value }): string | undefined => {
            if (isString(value) && options.pattern) {
                return options.pattern.test(value) ? value : undefined;
            }
            return value;
        }),
    );

    // Format-specific validation
    const format = get(options, 'format');
    switch (format) {
        case 'phone': {
            decorators.push(IsPhoneNumber(undefined, validationOptions));
            break;
        }
        case 'alphanumeric': {
            decorators.push(IsAlphanumeric(undefined, validationOptions));
            break;
        }
        case 'hexColor': {
            decorators.push(IsHexColor(validationOptions));
            break;
        }
        case 'ip': {
            decorators.push(IsIP(undefined, validationOptions));
            break;
        }
        case 'json': {
            decorators.push(IsJSON(validationOptions));
            break;
        }
        case 'base64': {
            const base64Options = {
                urlSafe: false,
                paddingRequired: true,
                ...validationOptions,
            };
            decorators.push(IsBase64(base64Options));
            break;
        }
    }

    return applyDecorators(...decorators);
};

export const StringFieldOptional = (
    options: Omit<ApiPropertyOptions, 'type' | 'required'> & IStringFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), StringField(mergedOptions));
};

export const TokenField = (options: Omit<ApiPropertyOptions, 'type'> & ITokenFieldOptions = {}): PropertyDecorator => {
    const decorators = [Type(() => String)];
    const isEach = get(options, 'each', false);

    decorators.push(IsJWT({ each: isEach }));
    handleNullableAndRequired(decorators, options);

    addSwaggerDecorator(decorators, options as Record<string, unknown>, String, {
        isArray: isEach,
    });

    return applyDecorators(...decorators);
};

export const TokenFieldOptional = (
    options: Omit<ApiPropertyOptions, 'type' | 'required'> & ITokenFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), TokenField(mergedOptions));
};

export const PasswordField = (
    pattern?: RegExp | string,
    options: Omit<ApiPropertyOptions, 'type' | 'minLength'> & IStringFieldOptions = {},
): PropertyDecorator => {
    const passwordOptions = merge({ minLength: 6 }, options);
    const decorators = [StringField(passwordOptions), IsPassword(pattern, get(options, 'validationOptions', {}))];

    handleNullableAndRequired(decorators, options);

    return applyDecorators(...decorators);
};

export const PasswordFieldOptional = (
    options: Omit<ApiPropertyOptions, 'type' | 'required' | 'minLength'> & IStringFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), PasswordField(undefined, mergedOptions));
};

export const BooleanField = (
    options: Omit<ApiPropertyOptions, 'type'> & IBooleanFieldOptions = {},
): PropertyDecorator => {
    const decorators = [ToBoolean(), IsBoolean()];

    handleNullableAndRequired(decorators, options);
    addSwaggerDecorator(decorators, options as Record<string, unknown>, Boolean);

    return applyDecorators(...decorators);
};

export const BooleanFieldOptional = (
    options: Omit<ApiPropertyOptions, 'type' | 'required'> & IBooleanFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), BooleanField(mergedOptions));
};

export const EmailField = (options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {}): PropertyDecorator => {
    const emailOptions = merge({ toLowerCase: true }, options);
    const decorators = [IsEmail(), StringField(emailOptions)];

    handleNullableAndRequired(decorators, options);

    return applyDecorators(...decorators);
};

export const EmailFieldOptional = (
    options: Omit<ApiPropertyOptions, 'type' | 'required'> & IStringFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), EmailField(mergedOptions));
};

export const UUIDField = (
    options: Omit<ApiPropertyOptions, 'type' | 'format' | 'isArray'> & IFieldOptions = {},
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
    options: Omit<ApiPropertyOptions, 'type' | 'required' | 'isArray'> & IFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), UUIDField(mergedOptions));
};

export const URLField = (options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {}): PropertyDecorator => {
    const decorators = [StringField(options)];
    const isEach = get(options, 'each', false);

    decorators.push(IsUrl({}, { each: isEach }));
    handleNullableAndRequired(decorators, options);

    return applyDecorators(...decorators);
};

export const URLFieldOptional = (
    options: Omit<ApiPropertyOptions, 'type' | 'required'> & IStringFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), URLField(mergedOptions));
};

// New ArrayField decorator
export const ArrayField = <_T>(
    itemType: () => Constructor,
    options: Omit<ApiPropertyOptions, 'type' | 'isArray'> & IArrayFieldOptions = {},
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
    options: Omit<ApiPropertyOptions, 'type' | 'required' | 'isArray'> & IArrayFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional(get(options, 'validationOptions', {})), ArrayField(itemType, mergedOptions));
};

// Enhanced DateField with min/max date validation
export const DateField = (options: Omit<ApiPropertyOptions, 'type'> & IDateFieldOptions = {}): PropertyDecorator => {
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
    options: Omit<ApiPropertyOptions, 'type' | 'required'> & IDateFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), DateField(mergedOptions));
};

export const EnumField = <TEnum extends object>(
    getEnum: () => TEnum,
    options: Omit<ApiPropertyOptions, 'type' | 'enum' | 'isArray'> & IEnumFieldOptions = {},
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
    options: Omit<ApiPropertyOptions, 'type' | 'required' | 'enum'> & IEnumFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), EnumField(getEnum, mergedOptions));
};

export const ClassField = <TClass extends Constructor>(
    getClass: () => TClass,
    options: Omit<ApiPropertyOptions, 'type'> & IClassFieldOptions = {},
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
    options: Omit<ApiPropertyOptions, 'type' | 'required'> & IClassFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), ClassField(getClass, mergedOptions));
};

// Phone number field
export const PhoneField = (
    country?: string,
    options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
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
    options: Omit<ApiPropertyOptions, 'type' | 'required'> & IStringFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional(get(options, 'validationOptions', {})), PhoneField(country, mergedOptions));
};

// JSON field
export const JsonField = (options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {}): PropertyDecorator => {
    const decorators = [Type(() => String), IsJSON(get(options, 'validationOptions', {}))];

    handleNullableAndRequired(decorators, options);
    addTransformDecorator(decorators, options);
    addSwaggerDecorator(decorators, options as Record<string, unknown>, Object);

    return applyDecorators(...decorators);
};

export const JsonFieldOptional = (
    options: Omit<ApiPropertyOptions, 'type' | 'required'> & IStringFieldOptions = {},
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
            return (obj as Record<string | symbol, unknown>)[propertyKey];
        })(target, propertyKey);
    };

// Safe variable name extraction with enhanced error handling
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

// Export utility functions for advanced usage
export const FieldUtils = {
    addConditionalDecorator,
    handleNullableAndRequired,
    addSwaggerDecorator,
    addTransformDecorator,
    getVariableName,
};

// File validation decorator
export const FileField = (options: Omit<ApiPropertyOptions, 'type'> & IFileFieldOptions = {}): PropertyDecorator => {
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
        format: 'binary',
        type: 'file',
    });

    return applyDecorators(...decorators);
};

export const FileFieldOptional = (
    options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFileFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), FileField(mergedOptions));
};

// Geographic coordinates validation
export const GeoField = (options: Omit<ApiPropertyOptions, 'type'> & IGeoFieldOptions = {}): PropertyDecorator => {
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
    options: Omit<ApiPropertyOptions, 'type' | 'required'> & IGeoFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), GeoField(mergedOptions));
};

// Credit card validation
export const CreditCardField = (
    options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
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
                    let digit = parseInt(digits[i]);
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
        example: '4111111111111111',
        description: 'Credit card number (will be validated using Luhn algorithm)',
    });

    return applyDecorators(...decorators);
};

export const CreditCardFieldOptional = (
    options: Omit<ApiPropertyOptions, 'type' | 'required'> & IStringFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), CreditCardField(mergedOptions));
};

// Currency field with validation
export const CurrencyField = (
    options: Omit<ApiPropertyOptions, 'type'> & INumberFieldOptions = {},
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
        example: 99.99,
        description: 'Currency amount (will be rounded to 2 decimal places)',
    });

    return applyDecorators(...decorators);
};

export const CurrencyFieldOptional = (
    options: Omit<ApiPropertyOptions, 'type' | 'required'> & INumberFieldOptions = {},
): PropertyDecorator => {
    const mergedOptions = merge({ required: false }, options);
    return applyDecorators(IsOptional({ each: get(options, 'each', false) }), CurrencyField(mergedOptions));
};
