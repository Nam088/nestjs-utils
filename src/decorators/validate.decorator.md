# Enhanced Validation Decorators

## Overview

Bộ validation decorators được nâng cấp với khả năng customize cao, hỗ trợ đa ngôn ngữ và tận dụng tối đa sức mạnh của class-validator.

## Key Features

### 1. Flexible Message Customization

```typescript
@StringField({
    messages: {
        required: 'Tên là bắt buộc',
        minLength: 'Tên phải có ít nhất {minLength} ký tự',
        maxLength: 'Tên không được vượt quá {maxLength} ký tự'
    },
    minLength: 2,
    maxLength: 50
})
name: string;
```

### 2. Custom Validators

```typescript
// Tạo custom validator
const isVietnamesePhoneNumber = FieldUtils.createCustomValidator(
    'isVietnamesePhone',
    (value: string) => /^(0|\+84)[3-9]\d{8}$/.test(value),
    'Số điện thoại không đúng định dạng Việt Nam'
);

@StringField({
    customValidators: [isVietnamesePhoneNumber]
})
phone: string;
```

### 3. ValidationRuleBuilder Pattern

```typescript
@FieldUtils.ValidationRuleBuilder
    .create()
    .addValidator(IsString())
    .addValidator(MinLength(3))
    .addTransform(Transform(({ value }) => value?.trim().toLowerCase()))
    .setMessage('required', 'Username là bắt buộc')
    .setMessage('minLength', 'Username phải có ít nhất 3 ký tự')
    .apply()
username: string;
```

### 4. Skip Default Validation

```typescript
@StringField({
    skipDefaultValidation: true,
    customValidators: [
        IsString({ message: 'Phải là chuỗi' }),
        // Chỉ validate những gì bạn muốn
    ]
})
customField: string;
```

### 5. Flexible Field Factory

```typescript
// Tạo field type tái sử dụng
const VietnameseNameField = FieldUtils.createFlexibleField(
    () => String,
    [
        IsString({ message: 'Tên phải là chuỗi ký tự' }),
        Matches(/^[a-zA-ZÀ-ỹ\s]+$/, { message: 'Tên chỉ được chứa chữ cái tiếng Việt' })
    ],
    { trim: true }
);

export class PersonDto {
    @VietnameseNameField({
        messages: {
            required: 'Họ tên là bắt buộc'
        }
    })
    fullName: string;
}
```

## Advanced Usage Examples

### Complex Business Rules

```typescript
export class OrderDto {
    @NumberField({
        customValidators: [
            FieldUtils.createCustomValidator(
                'isValidOrderAmount',
                (value: number, constraints: number[]) => {
                    const minAmount = constraints?.[0] || 0;
                    const maxAmount = constraints?.[1] || Infinity;
                    return value >= minAmount && value <= maxAmount;
                },
                'Số tiền đặt hàng phải từ {min} đến {max} VNĐ',
                [10000, 50000000] // min: 10k, max: 50M
            )
        ],
        customTransforms: [
            FieldUtils.createCustomTransform((value: number) => Math.round(value))
        ],
        messages: {
            required: 'Số tiền đặt hàng là bắt buộc',
            invalid: 'Số tiền không hợp lệ'
        }
    })
    amount: number;
}
```

### Multi-language Support

```typescript
// Tạo message builder cho đa ngôn ngữ
const createMessages = (lang: 'vi' | 'en') => {
    const messages = {
        vi: {
            required: 'Trường này là bắt buộc',
            invalid: 'Giá trị không hợp lệ',
            minLength: 'Phải có ít nhất {minLength} ký tự'
        },
        en: {
            required: 'This field is required',
            invalid: 'Invalid value',
            minLength: 'Must be at least {minLength} characters'
        }
    };
    return messages[lang];
};

export class MultiLangDto {
    @StringField({
        messages: createMessages('vi'),
        minLength: 3
    })
    name: string;
}
```

### Conditional Validation

```typescript
export class UserRegistrationDto {
    @EnumField(() => UserType)
    userType: UserType;

    @ConditionalField(
        (obj: UserRegistrationDto) => obj.userType === UserType.BUSINESS,
        StringField({
            messages: {
                required: 'Mã số thuế là bắt buộc đối với doanh nghiệp'
            },
            pattern: /^\d{10}(-\d{3})?$/
        })
    )
    taxCode?: string;

    @ConditionalField(
        (obj: UserRegistrationDto) => obj.userType === UserType.INDIVIDUAL,
        StringField({
            messages: {
                required: 'CMND/CCCD là bắt buộc đối với cá nhân'
            },
            pattern: /^\d{9}|\d{12}$/
        })
    )
    idNumber?: string;
}
```

## Best Practices

1. **Sử dụng messages object** thay vì message string để có thể customize từng loại lỗi
2. **Tận dụng ValidationRuleBuilder** cho các validation phức tạp
3. **Tạo custom validators** cho business rules cụ thể
4. **Sử dụng skipDefaultValidation** khi cần control hoàn toàn validation logic
5. **Tạo flexible field factories** cho các pattern validation thường dùng

## Migration Guide

### Từ version cũ:
```typescript
@StringField({ message: 'Tên không hợp lệ' })
name: string;
```

### Sang version mới:
```typescript
@StringField({
    messages: {
        required: 'Tên là bắt buộc',
        invalid: 'Tên không hợp lệ',
        minLength: 'Tên quá ngắn'
    }
})
name: string;
```