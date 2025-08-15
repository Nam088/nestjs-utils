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

// Enhanced interfaces with better flexibility
interface IFieldOptions {
    each?: boolean;
    swagger?: boolean;
    nullable?: boolean;
    groups?: string[];
    required?: boolean;
    transform?: (value: unknown) => unknown;
    validationOptions?: ValidationOptions;
    message?: string | ((validationArguments: ValidationArguments) => string);
    messages?: {
        required?: string;
        invalid?: string;
        nullable?: string;
        [key: string]: string | undefined;
    };
    // Allow custom validation decorators
    customValidators?: PropertyDecorator[];
    // Allow custom transform decorators
    customTransforms?: PropertyDecorator[];
    // Skip default validations
    skipDefaultValidation?: boolean;
}

interface IArrayFieldOptions extends IFieldOptions {
    minSize?: number;
    maxSize?: number;
    uniqueItems?: boolean;
    messages?: {
        required?: string;
        invalid?: string;
        minSize?: string;
        maxSize?: string;
        uniqueItems?: string;
        [key: string]: string | undefined;
    };
}

interface INumberFieldOptions extends IFieldOptions {
    min?: number;
    max?: number;
    int?: boolean;
    isPositive?: boolean;
    allowInfinity?: boolean;
    allowNaN?: boolean;
    messages?: {
        required?: string;
        invalid?: string;
        min?: string;
        max?: string;
        int?: string;
        positive?: string;
        [key: string]: string | undefined;
    };
}

interface IStringFieldOptions extends IFieldOptions {
    minLength?: number;
    maxLength?: number;
    toLowerCase?: boolean;
    toUpperCase?: boolean;
    trim?: boolean;
    pattern?: RegExp;
    format?: 'email' | 'url' | 'uuid' | 'phone' | 'alphanumeric' | 'hexColor' | 'ip' | 'json' | 'base64';
    skipLengthValidation?: boolean;
    messages?: {
        required?: string;
        invalid?: string;
        minLength?: string;
        maxLength?: string;
        pattern?: string;
        format?: string;
        email?: string;
        url?: string;
        uuid?: string;
        phone?: string;
        [key: string]: string | undefined;
    };
}

interface IEnumFieldOptions extends IFieldOptions {
    enumName?: string;
}

interface IDateFieldOptions extends IFieldOptions {
    minDate?: Date;
    maxDate?: Date;
    messages?: {
        required?: string;
        invalid?: string;
        minDate?: string;
        maxDate?: string;
        [key: string]: string | undefined;
    };
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

export const createValidationOptions = (
    options: IFieldOptions,
    messageKey?: string,
    defaultMessage?: string,
): ValidationOptions => {
    const validationOptions = get(options, 'validationOptions', {}) as ValidationOptions;
    const each = get(options, 'each', false);

    let message: string | undefined = defaultMessage;

    // Priority: specific message > messages object > general message > validationOptions.message > default
    if (messageKey && options.messages && options.messages[messageKey]) {
        message = options.messages[messageKey];
    } else if (options.message) {
        message = isFunction(options.message) ? undefined : options.message;
    } else if (validationOptions.message) {
        message = validationOptions.message as string;
    }

    return {
        each,
        message,
        groups: options.groups,
        ...validationOptions,
    };
};

// Helper to add custom decorators
export const addCustomDecorators = (decorators: PropertyDecorator[], options: IFieldOptions): void => {
    if (options.customValidators) {
        decorators.push(...options.customValidators);
    }
    if (options.customTransforms) {
        decorators.push(...options.customTransforms);
    }
};

export const handleNullableAndRequired = (decorators: PropertyDecorator[], options: IFieldOptions): void => {
    if (get(options, 'nullable', false)) {
        const nullableOptions = createValidationOptions(options, 'nullable', '$property cannot be null');
        decorators.push(IsNullable(nullableOptions));
    } else {
        const notNullOptions = createValidationOptions(options, 'required', '$property should not be null');
        decorators.push(NotEquals(null, notNullOptions));
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

    // Add custom decorators first
    addCustomDecorators(decorators, options);

    if (!get(options, 'skipDefaultValidation', false)) {
        handleNullableAndRequired(decorators, options);
        addTransformDecorator(decorators, options);

        // Enhanced number validation
        const numberOptions = {
            allowNaN: get(options, 'allowNaN', false),
            allowInfinity: get(options, 'allowInfinity', false),
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
            case 'email': {
                const emailOptions = createValidationOptions(options, 'email', '$property must be a valid email');
                decorators.push(IsEmail({}, emailOptions));
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
            case 'phone': {
                const phoneOptions = createValidationOptions(
                    options,
                    'phone',
                    '$property must be a valid phone number',
                );
                decorators.push(IsPhoneNumber(undefined, phoneOptions));
                break;
            }
            case 'alphanumeric': {
                const alphanumericOptions = createValidationOptions(
                    options,
                    'format',
                    '$property must contain only letters and numbers',
                );
                decorators.push(IsAlphanumeric(undefined, alphanumericOptions));
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
            case 'base64': {
                const base64ValidationOptions = createValidationOptions(
                    options,
                    'format',
                    '$property must be a valid base64 string',
                );
                const base64Options = {
                    urlSafe: false,
                    paddingRequired: true,
                    ...base64ValidationOptions,
                };
                decorators.push(IsBase64(base64Options));
                break;
            }
        }
    }

    addSwaggerDecorator(decorators, options as Record<string, unknown>, String, {
        isArray: get(options, 'each', false),
    });

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

// Custom validator factory functions
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
            target: (object as { constructor: new (...args: unknown[]) => unknown }).constructor,
            propertyName: propertyName as string,
            constraints: constraints || [],
            options: { message: defaultMessage || `$property failed ${validatorName} validation` },
            validator: {
                validate(value: unknown, args?: ValidationArguments): boolean {
                    return validationFunction(value, args?.constraints as unknown[]);
                },
            },
        });
    };

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
    (options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {}) => {
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
export const buildValidationMessage = (template: string, replacements: Record<string, any> = {}): string =>
    Object.entries(replacements).reduce(
        (message, [key, value]) => message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
        template,
    );

// Validation rule builder
export class ValidationRuleBuilder {
    private decorators: PropertyDecorator[] = [];
    private options: IFieldOptions = {};

    static create(): ValidationRuleBuilder {
        return new ValidationRuleBuilder();
    }

    addValidator(validator: PropertyDecorator): this {
        this.decorators.push(validator);
        return this;
    }

    addTransform(transform: PropertyDecorator): this {
        this.decorators.push(transform);
        return this;
    }

    setMessage(key: string, message: string): this {
        if (!this.options.messages) {
            this.options.messages = {};
        }
        this.options.messages[key] = message;
        return this;
    }

    setOption<K extends keyof IFieldOptions>(key: K, value: IFieldOptions[K]): this {
        this.options[key] = value;
        return this;
    }

    build(): { decorators: PropertyDecorator[]; options: IFieldOptions } {
        return {
            decorators: [...this.decorators],
            options: { ...this.options },
        };
    }

    apply(): PropertyDecorator {
        const { decorators } = this.build();
        return applyDecorators(...decorators);
    }
}

// Export utility functions for advanced usage
export const FieldUtils = {
    addConditionalDecorator,
    handleNullableAndRequired,
    addSwaggerDecorator,
    addTransformDecorator,
    addCustomDecorators,
    getVariableName,
    createValidationOptions,
    createCustomValidator,
    createCustomTransform,
    createFlexibleField,
    buildValidationMessage,
    ValidationRuleBuilder,
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
