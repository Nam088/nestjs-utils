# @ecom-co/utils

A comprehensive utility library for e-commerce platform development with NestJS, providing decorators, DTOs, constants, and validation utilities.

## 📦 Installation

```bash
npm install @ecom-co/utils
```

## 🚀 Features

- **API Documentation Decorators**: Streamlined Swagger documentation with `@ApiEndpoint`
- **Validation Decorators**: Type-safe validation decorators with comprehensive field types
- **Standardized DTOs**: Consistent API response and error handling structures
- **Authentication Constants**: Predefined auth types and configurations
- **Pagination Support**: Offset and cursor-based pagination utilities
- **Error Handling**: Standardized error responses and filters

## 📚 Table of Contents

- [Decorators](#decorators)
  - [API Endpoint Decorator](#api-endpoint-decorator)
  - [Validation Decorators](#validation-decorators)
- [DTOs](#dtos)
- [Constants](#constants)
- [Filters](#filters)
- [Configuration](#configuration)

## 🎯 Decorators

### API Endpoint Decorator

The `@ApiEndpoint` decorator provides comprehensive Swagger documentation with minimal configuration.

#### Basic Usage

```typescript
import { ApiEndpoint } from '@ecom-co/utils';
import { HttpStatus } from '@nestjs/common';
import { UserDto } from './user.dto';

@Controller('users')
export class UserController {
  @ApiEndpoint({
    summary: 'Create a new user',
    description: 'Creates a new user account with the provided information',
    tags: ['Users'],
    responses: { 
      [HttpStatus.CREATED]: { 
        type: UserDto, 
        description: 'User created successfully' 
      } 
    },
    auth: { type: AUTH_TYPE.JWT, required: true },
    body: {
      type: CreateUserDto,
      description: 'User creation data'
    },
    includeCommonErrors: true
  })
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    // Implementation
  }
}
```

#### Advanced Configuration

```typescript
@ApiEndpoint({
  summary: 'Get paginated users',
  tags: ['Users'],
  responses: { 
    [HttpStatus.OK]: { 
      type: UserDto, 
      description: 'List of users' 
    } 
  },
  paginationType: PAGINATION_TYPE.OFFSET,
  queries: [
    { name: 'search', type: 'string', description: 'Search term' },
    { name: 'status', type: 'string', enum: ['active', 'inactive'] }
  ],
  params: [
    { name: 'id', type: 'uuid', description: 'User ID' }
  ],
  rateLimit: {
    limit: 100,
    window: '1h',
    message: 'Too many requests'
  },
  cache: {
    ttl: 300,
    description: 'Cache for 5 minutes'
  }
})
@Get()
async getUsers() {
  // Implementation
}
```

#### Shorthand Decorators

```typescript
// GET endpoint
@ApiGetEndpoint({
  summary: 'Get user by ID',
  response: UserDto,
  params: [{ name: 'id', type: 'uuid' }]
})
@Get(':id')
async getUser(@Param('id') id: string) {}

// POST endpoint
@ApiPostEndpoint({
  summary: 'Create user',
  response: UserDto,
  body: { type: CreateUserDto }
})
@Post()
async createUser(@Body() dto: CreateUserDto) {}

// DELETE endpoint
@ApiDeleteEndpoint({
  summary: 'Delete user'
})
@Delete(':id')
async deleteUser(@Param('id') id: string) {}
```

### Validation Decorators

Comprehensive validation decorators with type safety and Swagger integration.

#### Basic Field Types

```typescript
import { 
  StringField, 
  NumberField, 
  BooleanField, 
  EmailField,
  UUIDField 
} from '@ecom-co/utils';

export class CreateUserDto {
  @StringField({ 
    minLength: 2, 
    maxLength: 50,
    description: 'User full name'
  })
  name!: string;

  @EmailField({ 
    description: 'User email address' 
  })
  email!: string;

  @NumberField({ 
    min: 18, 
    max: 100,
    description: 'User age'
  })
  age!: number;

  @BooleanField({ 
    description: 'Whether user is active' 
  })
  isActive!: boolean;

  @UUIDField({ 
    description: 'Organization ID' 
  })
  organizationId!: string;
}
```

#### Advanced Field Types

```typescript
import { 
  ArrayField, 
  DateField, 
  EnumField, 
  ClassField,
  PasswordField,
  PhoneField,
  JsonField,
  CurrencyField
} from '@ecom-co/utils';

export class ProductDto {
  @ArrayField(() => String, { 
    minSize: 1, 
    maxSize: 10,
    description: 'Product tags'
  })
  tags!: string[];

  @DateField({ 
    minDate: new Date('2020-01-01'),
    description: 'Product creation date'
  })
  createdAt!: Date;

  @EnumField(() => ProductStatus, { 
    description: 'Product status' 
  })
  status!: ProductStatus;

  @ClassField(() => CategoryDto, { 
    description: 'Product category' 
  })
  category!: CategoryDto;

  @PasswordField(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    description: 'Strong password'
  })
  password!: string;

  @PhoneField('VN', { 
    description: 'Contact phone number' 
  })
  phone!: string;

  @JsonField({ 
    description: 'Additional metadata' 
  })
  metadata!: Record<string, any>;

  @CurrencyField({ 
    min: 0,
    description: 'Product price'
  })
  price!: number;
}
```

#### Optional Fields

```typescript
export class UpdateUserDto {
  @StringFieldOptional({ 
    minLength: 2, 
    maxLength: 50 
  })
  name?: string;

  @EmailFieldOptional()
  email?: string;

  @NumberFieldOptional({ 
    min: 18, 
    max: 100 
  })
  age?: number;
}
```

#### Specialized Fields

```typescript
import { 
  FileField, 
  GeoField, 
  CreditCardField,
  TokenField
} from '@ecom-co/utils';

export class OrderDto {
  @FileField({ 
    maxSize: 5 * 1024 * 1024, // 5MB
    mimeTypes: ['image/jpeg', 'image/png'],
    description: 'Product image'
  })
  image!: Express.Multer.File;

  @GeoField({ 
    latitude: true,
    description: 'Delivery location'
  })
  latitude!: number;

  @GeoField({ 
    longitude: true,
    description: 'Delivery location'
  })
  longitude!: number;

  @CreditCardField({ 
    description: 'Payment card number' 
  })
  cardNumber!: string;

  @TokenField({ 
    description: 'JWT token' 
  })
  token!: string;
}
```

## 📋 DTOs

### API Response DTO

Standardized API response structure with Swagger documentation.

```typescript
import { ApiResponseDto } from '@ecom-co/utils';

// Create response DTO for User
const UserResponseDto = ApiResponseDto(UserDto);

// Usage in controller
@ApiEndpoint({
  responses: { 
    [HttpStatus.OK]: { 
      type: UserResponseDto 
    } 
  }
})
@Get(':id')
async getUser(@Param('id') id: string) {
  const user = await this.userService.findById(id);
  return new ApiResponseData(user, 'User retrieved successfully');
}
```

### Error Response DTO

Consistent error response structure.

```typescript
import { ErrorResponseDto } from '@ecom-co/utils';

@ApiEndpoint({
  errors: [
    HttpStatus.NOT_FOUND,
    { 
      status: HttpStatus.BAD_REQUEST, 
      description: 'Invalid user data' 
    }
  ]
})
```

### Paginated Response DTO

Support for both offset and cursor-based pagination.

```typescript
import { 
  ApiPaginatedResponseDto, 
  ApiCursorPaginatedResponseDto 
} from '@ecom-co/utils';

// Offset pagination
const UserPaginatedResponseDto = ApiPaginatedResponseDto(UserDto);

// Cursor pagination
const UserCursorPaginatedResponseDto = ApiCursorPaginatedResponseDto(UserDto);
```

## 🔧 Constants

### Authentication Types

```typescript
import { AUTH_TYPE } from '@ecom-co/utils';

// Available auth types
AUTH_TYPE.JWT        // JWT Bearer token
AUTH_TYPE.API_KEY    // API Key authentication
AUTH_TYPE.OAUTH2     // OAuth2 authentication
AUTH_TYPE.BASIC      // Basic authentication
AUTH_TYPE.COOKIE     // Cookie-based authentication
```

### Pagination Types

```typescript
import { PAGINATION_TYPE } from '@ecom-co/utils';

PAGINATION_TYPE.OFFSET  // Offset-based pagination
PAGINATION_TYPE.CURSOR  // Cursor-based pagination
```

### Database Operators

```typescript
import { OPERATOR } from '@ecom-co/utils';

// Available operators for queries
OPERATOR.EQ    // Equal
OPERATOR.NE    // Not equal
OPERATOR.GT    // Greater than
OPERATOR.GTE   // Greater than or equal
OPERATOR.LT    // Less than
OPERATOR.LTE   // Less than or equal
OPERATOR.LIKE  // Like (string matching)
OPERATOR.IN    // In array
OPERATOR.NIN   // Not in array
```

## 🛡️ Filters

### HTTP Exception Filter

Global exception handling with standardized error responses.

```typescript
import { HttpExceptionFilter } from '@ecom-co/utils';
import { Reflector } from '@nestjs/core';

// In your main.ts
app.useGlobalFilters(new HttpExceptionFilter(app.get(Reflector)));

// Or in a controller
@UseFilters(new HttpExceptionFilter(reflector))
export class AppController {}

// With custom options
app.useGlobalFilters(
  new HttpExceptionFilter(
    app.get(Reflector),
    {
      isDevelopment: process.env.NODE_ENV === 'development',
      enableSanitization: true,
      enableRateLimitTracking: true,
      customErrorMessages: {
        404: 'Resource not found',
        500: 'Internal server error'
      }
    }
  )
);
```

## ⚙️ Configuration

### Swagger Configuration

```typescript
import { swaggerConfig } from '@ecom-co/utils';

// In your main.ts
const config = await NestFactory.create(AppModule);
const document = SwaggerModule.createDocument(app, swaggerConfig);
SwaggerModule.setup('api', app, document);
```

## 📖 Examples

### Complete Controller Example

```typescript
import { 
  ApiEndpoint, 
  ApiGetEndpoint, 
  ApiPostEndpoint,
  ApiDeleteEndpoint,
  AUTH_TYPE,
  PAGINATION_TYPE,
  HttpStatus 
} from '@ecom-co/utils';

@Controller('products')
export class ProductController {
  @ApiGetEndpoint({
    summary: 'Get all products',
    tags: ['Products'],
    response: ProductDto,
    paginationType: PAGINATION_TYPE.OFFSET,
    queries: [
      { name: 'category', type: 'string' },
      { name: 'minPrice', type: 'number' },
      { name: 'maxPrice', type: 'number' }
    ],
    includeCommonErrors: true
  })
  @Get()
  async getProducts() {
    // Implementation
  }

  @ApiPostEndpoint({
    summary: 'Create product',
    tags: ['Products'],
    response: ProductDto,
    auth: { type: AUTH_TYPE.JWT, required: true },
    body: { type: CreateProductDto },
    errors: [HttpStatus.CONFLICT]
  })
  @Post()
  async createProduct(@Body() dto: CreateProductDto) {
    // Implementation
  }

  @ApiDeleteEndpoint({
    summary: 'Delete product',
    tags: ['Products'],
    auth: { type: AUTH_TYPE.JWT, required: true },
    params: [{ name: 'id', type: 'uuid' }]
  })
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    // Implementation
  }
}
```

### Complete DTO Example

```typescript
import { 
  StringField, 
  NumberField, 
  EmailField, 
  ArrayField,
  DateField,
  BooleanField,
  UUIDField,
  CurrencyField
} from '@ecom-co/utils';

export class CreateProductDto {
  @StringField({ 
    minLength: 3, 
    maxLength: 100,
    description: 'Product name'
  })
  name!: string;

  @StringField({ 
    maxLength: 1000,
    description: 'Product description'
  })
  description!: string;

  @CurrencyField({ 
    min: 0,
    description: 'Product price'
  })
  price!: number;

  @NumberField({ 
    min: 0,
    description: 'Available stock'
  })
  stock!: number;

  @ArrayField(() => String, { 
    minSize: 1,
    description: 'Product categories'
  })
  categories!: string[];

  @UUIDField({ 
    description: 'Brand ID' 
  })
  brandId!: string;

  @BooleanField({ 
    description: 'Product availability' 
  })
  isActive!: boolean;

  @DateField({ 
    description: 'Release date' 
  })
  releaseDate!: Date;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please open an issue on GitHub or contact the development team.
