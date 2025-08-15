# @ecom-co/utils

<div align="center">

![Version](https://img.shields.io/npm/v/@ecom-co/utils)
![Downloads](https://img.shields.io/npm/dm/@ecom-co/utils)
![License](https://img.shields.io/npm/l/@ecom-co/utils)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![NestJS](https://img.shields.io/badge/NestJS-10.0+-red)

**A comprehensive utility library for e-commerce platform development with NestJS**

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples)

</div>

---

## ✨ Features

- 🎯 **Type-Safe Validation Decorators** - Comprehensive field validation with automatic Swagger integration
- 📚 **API Documentation** - Streamlined Swagger documentation with `@ApiEndpoint` decorators
- 🏗️ **Standardized DTOs** - Consistent API response and error handling structures
- 🔐 **Authentication Support** - Predefined auth types and configurations
- 📄 **Pagination Utilities** - Offset and cursor-based pagination support
- 🛡️ **Error Handling** - Global exception filters with standardized responses
- 🎨 **Modern UI Components** - Beautiful and responsive design patterns
- ⚡ **Performance Optimized** - Lightweight and efficient utilities

## 🚀 Installation

```bash
npm install @ecom-co/utils
```

```bash
yarn add @ecom-co/utils
```

```bash
pnpm add @ecom-co/utils
```

## ⚡ Quick Start

### 1. Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { swaggerConfig } from '@ecom-co/utils';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}

// In main.ts
const app = await NestFactory.create(AppModule);
const document = SwaggerModule.createDocument(app, swaggerConfig);
SwaggerModule.setup('api', app, document);
```

### 2. Create Your First DTO

```typescript
import { 
  StringField, 
  EmailField, 
  NumberField, 
  BooleanField 
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
}
```

### 3. Create Your First Controller

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ApiPostEndpoint, AUTH_TYPE, HttpStatus } from '@ecom-co/utils';
import { CreateUserDto, UserDto } from './dto';

@Controller('users')
export class UserController {
  @ApiPostEndpoint({
    summary: 'Create a new user',
    description: 'Creates a new user account with the provided information',
    tags: ['Users'],
    response: UserDto,
    auth: { type: AUTH_TYPE.JWT, required: true },
    body: { type: CreateUserDto },
    errors: [HttpStatus.CONFLICT, HttpStatus.BAD_REQUEST]
  })
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    // Your implementation here
    return { message: 'User created successfully' };
  }
}
```

## 📚 Documentation

### 🎯 Validation Decorators

#### Basic Field Types

| Decorator | Type | Description |
|-----------|------|-------------|
| `@StringField()` | `string` | Text validation with length constraints |
| `@NumberField()` | `number` | Numeric validation with min/max values |
| `@BooleanField()` | `boolean` | Boolean validation with transformation |
| `@EmailField()` | `string` | Email validation with format checking |
| `@UUIDField()` | `string` | UUID v4 validation |
| `@DateField()` | `Date` | Date validation with range constraints |

#### Advanced Field Types

| Decorator | Type | Description |
|-----------|------|-------------|
| `@ArrayField()` | `T[]` | Array validation with size constraints |
| `@EnumField()` | `enum` | Enum validation with type safety |
| `@ClassField()` | `class` | Nested object validation |
| `@PasswordField()` | `string` | Password validation with custom patterns |
| `@PhoneField()` | `string` | Phone number validation |
| `@JsonField()` | `object` | JSON string validation |
| `@FileField()` | `File` | File upload validation |
| `@GeoField()` | `number` | Geographic coordinates validation |
| `@CreditCardField()` | `string` | Credit card number validation |
| `@CurrencyField()` | `number` | Currency amount validation |

#### Usage Examples

```typescript
import { 
  StringField, 
  NumberField, 
  ArrayField, 
  DateField,
  EnumField,
  PasswordField,
  CurrencyField
} from '@ecom-co/utils';

export class ProductDto {
  @StringField({ 
    minLength: 3, 
    maxLength: 100,
    description: 'Product name',
    toLowerCase: true,
    trim: true
  })
  name!: string;

  @NumberField({ 
    min: 0,
    max: 1000000,
    isPositive: true,
    description: 'Product price'
  })
  price!: number;

  @ArrayField(() => String, { 
    minSize: 1, 
    maxSize: 10,
    uniqueItems: true,
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

  @PasswordField(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    description: 'Strong password with special characters'
  })
  password!: string;

  @CurrencyField({ 
    min: 0,
    description: 'Product price in USD'
  })
  priceUSD!: number;
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

### 📚 API Documentation Decorators

#### Basic Usage

```typescript
import { ApiEndpoint, AUTH_TYPE, PAGINATION_TYPE, HttpStatus } from '@ecom-co/utils';

@Controller('products')
export class ProductController {
  @ApiEndpoint({
    summary: 'Get all products',
    description: 'Retrieve a paginated list of products with filtering options',
    tags: ['Products'],
    responses: { 
      [HttpStatus.OK]: { 
        type: ProductDto, 
        description: 'List of products' 
      } 
    },
    paginationType: PAGINATION_TYPE.OFFSET,
    queries: [
      { name: 'search', type: 'string', description: 'Search term' },
      { name: 'category', type: 'string', enum: ['electronics', 'clothing', 'books'] },
      { name: 'minPrice', type: 'number', description: 'Minimum price filter' },
      { name: 'maxPrice', type: 'number', description: 'Maximum price filter' }
    ],
    auth: { type: AUTH_TYPE.JWT, required: false },
    includeCommonErrors: true
  })
  @Get()
  async getProducts() {
    // Implementation
  }
}
```

#### Shorthand Decorators

```typescript
// GET endpoint
@ApiGetEndpoint({
  summary: 'Get product by ID',
  description: 'Retrieve a specific product by its unique identifier',
  tags: ['Products'],
  response: ProductDto,
  params: [{ name: 'id', type: 'uuid', description: 'Product ID' }],
  auth: { type: AUTH_TYPE.JWT, required: false },
  errors: [HttpStatus.NOT_FOUND]
})
@Get(':id')
async getProduct(@Param('id') id: string) {}

// POST endpoint
@ApiPostEndpoint({
  summary: 'Create new product',
  description: 'Create a new product with the provided information',
  tags: ['Products'],
  response: ProductDto,
  body: { type: CreateProductDto, description: 'Product creation data' },
  auth: { type: AUTH_TYPE.JWT, required: true },
  errors: [HttpStatus.CONFLICT, HttpStatus.BAD_REQUEST]
})
@Post()
async createProduct(@Body() dto: CreateProductDto) {}

// PUT endpoint
@ApiPutEndpoint({
  summary: 'Update product',
  description: 'Update an existing product',
  tags: ['Products'],
  response: ProductDto,
  body: { type: UpdateProductDto },
  params: [{ name: 'id', type: 'uuid' }],
  auth: { type: AUTH_TYPE.JWT, required: true },
  errors: [HttpStatus.NOT_FOUND, HttpStatus.BAD_REQUEST]
})
@Put(':id')
async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {}

// DELETE endpoint
@ApiDeleteEndpoint({
  summary: 'Delete product',
  description: 'Permanently delete a product',
  tags: ['Products'],
  params: [{ name: 'id', type: 'uuid' }],
  auth: { type: AUTH_TYPE.JWT, required: true },
  errors: [HttpStatus.NOT_FOUND]
})
@Delete(':id')
async deleteProduct(@Param('id') id: string) {}
```

#### Advanced Configuration

```typescript
@ApiEndpoint({
  summary: 'Advanced product search',
  description: 'Search products with complex filtering and sorting',
  tags: ['Products'],
  responses: { 
    [HttpStatus.OK]: { 
      type: ProductDto, 
      description: 'Filtered products' 
    } 
  },
  paginationType: PAGINATION_TYPE.CURSOR,
  queries: [
    { name: 'q', type: 'string', description: 'Search query' },
    { name: 'category', type: 'string', enum: ['electronics', 'clothing', 'books'] },
    { name: 'brand', type: 'string' },
    { name: 'minPrice', type: 'number' },
    { name: 'maxPrice', type: 'number' },
    { name: 'inStock', type: 'boolean' },
    { name: 'sortBy', type: 'string', enum: ['name', 'price', 'createdAt'] },
    { name: 'sortOrder', type: 'string', enum: ['asc', 'desc'] }
  ],
  auth: { type: AUTH_TYPE.JWT, required: false },
  rateLimit: {
    limit: 100,
    window: '1h',
    message: 'Too many requests, please try again later'
  },
  cache: {
    ttl: 300,
    description: 'Cache results for 5 minutes'
  },
  includeCommonErrors: true
})
@Get('search')
async searchProducts() {
  // Implementation
}
```

### 📋 DTOs

#### API Response DTO

```typescript
import { ApiResponseDto, ApiResponseData } from '@ecom-co/utils';

// Create response DTO for User
const UserResponseDto = ApiResponseDto(UserDto);

// Usage in controller
@ApiGetEndpoint({
  response: UserResponseDto
})
@Get(':id')
async getUser(@Param('id') id: string) {
  const user = await this.userService.findById(id);
  return new ApiResponseData(user, 'User retrieved successfully');
}
```

#### Error Response DTO

```typescript
import { ErrorResponseDto } from '@ecom-co/utils';

@ApiEndpoint({
  errors: [
    HttpStatus.NOT_FOUND,
    { 
      status: HttpStatus.BAD_REQUEST, 
      description: 'Invalid user data' 
    },
    {
      status: HttpStatus.CONFLICT,
      description: 'User already exists'
    }
  ]
})
```

#### Paginated Response DTO

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

### 🔧 Constants

#### Authentication Types

```typescript
import { AUTH_TYPE } from '@ecom-co/utils';

// Available auth types
AUTH_TYPE.JWT        // JWT Bearer token
AUTH_TYPE.API_KEY    // API Key authentication
AUTH_TYPE.OAUTH2     // OAuth2 authentication
AUTH_TYPE.BASIC      // Basic authentication
AUTH_TYPE.COOKIE     // Cookie-based authentication
```

#### Pagination Types

```typescript
import { PAGINATION_TYPE } from '@ecom-co/utils';

PAGINATION_TYPE.OFFSET  // Offset-based pagination
PAGINATION_TYPE.CURSOR  // Cursor-based pagination
```

#### Database Operators

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

### 🛡️ Filters

#### HTTP Exception Filter

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

#### Validation Exception

Custom validation exception with structured error handling:

```typescript
import { ValidationException } from '@ecom-co/utils';

// Manual validation
if (!user.email) {
  throw new ValidationException([
    {
      property: 'email',
      constraints: {
        isNotEmpty: 'Email is required'
      }
    }
  ]);
}

// Multiple validation errors
if (!user.email || !user.password) {
  throw new ValidationException([
    {
      property: 'email',
      constraints: {
        isNotEmpty: 'Email is required'
      }
    },
    {
      property: 'password',
      constraints: {
        isNotEmpty: 'Password is required',
        minLength: 'Password must be at least 8 characters'
      }
    }
  ]);
}
```

**Response Format:**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Email is required",
  "errors": [
    "Email is required",
    "Password must be at least 8 characters"
  ],
  "fieldErrors": {
    "email": ["Email is required"],
    "password": [
      "Password is required", 
      "Password must be at least 8 characters"
    ]
  },
  "path": "/api/users",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestId": "abc123-def456-ghi789"
}
```

## 🎯 Examples

### Complete E-commerce Product Controller

```typescript
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query 
} from '@nestjs/common';
import { 
  ApiGetEndpoint, 
  ApiPostEndpoint, 
  ApiPutEndpoint, 
  ApiDeleteEndpoint,
  AUTH_TYPE,
  PAGINATION_TYPE,
  HttpStatus 
} from '@ecom-co/utils';

@Controller('products')
export class ProductController {
  @ApiGetEndpoint({
    summary: 'Get all products',
    description: 'Retrieve a paginated list of products with filtering',
    tags: ['Products'],
    response: ProductDto,
    paginationType: PAGINATION_TYPE.OFFSET,
    queries: [
      { name: 'category', type: 'string' },
      { name: 'minPrice', type: 'number' },
      { name: 'maxPrice', type: 'number' },
      { name: 'inStock', type: 'boolean' },
      { name: 'sortBy', type: 'string', enum: ['name', 'price', 'createdAt'] }
    ],
    auth: { type: AUTH_TYPE.JWT, required: false },
    includeCommonErrors: true
  })
  @Get()
  async getProducts(@Query() query: GetProductsQueryDto) {
    return this.productService.findAll(query);
  }

  @ApiGetEndpoint({
    summary: 'Get product by ID',
    description: 'Retrieve a specific product by its ID',
    tags: ['Products'],
    response: ProductDto,
    params: [{ name: 'id', type: 'uuid', description: 'Product ID' }],
    auth: { type: AUTH_TYPE.JWT, required: false },
    errors: [HttpStatus.NOT_FOUND]
  })
  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @ApiPostEndpoint({
    summary: 'Create new product',
    description: 'Create a new product with the provided data',
    tags: ['Products'],
    response: ProductDto,
    body: { type: CreateProductDto, description: 'Product creation data' },
    auth: { type: AUTH_TYPE.JWT, required: true },
    errors: [HttpStatus.CONFLICT, HttpStatus.BAD_REQUEST]
  })
  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @ApiPutEndpoint({
    summary: 'Update product',
    description: 'Update an existing product',
    tags: ['Products'],
    response: ProductDto,
    body: { type: UpdateProductDto },
    params: [{ name: 'id', type: 'uuid' }],
    auth: { type: AUTH_TYPE.JWT, required: true },
    errors: [HttpStatus.NOT_FOUND, HttpStatus.BAD_REQUEST]
  })
  @Put(':id')
  async updateProduct(
    @Param('id') id: string, 
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @ApiDeleteEndpoint({
    summary: 'Delete product',
    description: 'Permanently delete a product',
    tags: ['Products'],
    params: [{ name: 'id', type: 'uuid' }],
    auth: { type: AUTH_TYPE.JWT, required: true },
    errors: [HttpStatus.NOT_FOUND]
  })
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
```

### Complete DTO Examples

#### Product DTOs

```typescript
import { 
  StringField, 
  NumberField, 
  ArrayField, 
  DateField,
  BooleanField,
  UUIDField,
  CurrencyField,
  EnumField,
  ClassField
} from '@ecom-co/utils';

export class CreateProductDto {
  @StringField({ 
    minLength: 3, 
    maxLength: 100,
    description: 'Product name',
    toLowerCase: true,
    trim: true
  })
  name!: string;

  @StringField({ 
    maxLength: 1000,
    description: 'Product description'
  })
  description!: string;

  @CurrencyField({ 
    min: 0,
    description: 'Product price in USD'
  })
  price!: number;

  @NumberField({ 
    min: 0,
    description: 'Available stock quantity'
  })
  stock!: number;

  @ArrayField(() => String, { 
    minSize: 1,
    maxSize: 10,
    uniqueItems: true,
    description: 'Product categories'
  })
  categories!: string[];

  @UUIDField({ 
    description: 'Brand ID' 
  })
  brandId!: string;

  @BooleanField({ 
    description: 'Product availability status' 
  })
  isActive!: boolean;

  @DateField({ 
    description: 'Product release date' 
  })
  releaseDate!: Date;
}

export class UpdateProductDto {
  @StringFieldOptional({ 
    minLength: 3, 
    maxLength: 100 
  })
  name?: string;

  @StringFieldOptional({ 
    maxLength: 1000 
  })
  description?: string;

  @CurrencyFieldOptional({ 
    min: 0 
  })
  price?: number;

  @NumberFieldOptional({ 
    min: 0 
  })
  stock?: number;

  @ArrayFieldOptional(() => String, { 
    minSize: 1,
    maxSize: 10 
  })
  categories?: string[];

  @BooleanFieldOptional()
  isActive?: boolean;
}
```

#### User DTOs

```typescript
import { 
  StringField, 
  EmailField, 
  PasswordField,
  PhoneField,
  DateField,
  BooleanField,
  UUIDField,
  ArrayField,
  ClassField
} from '@ecom-co/utils';

export class CreateUserDto {
  @StringField({ 
    minLength: 2, 
    maxLength: 50,
    description: 'User first name'
  })
  firstName!: string;

  @StringField({ 
    minLength: 2, 
    maxLength: 50,
    description: 'User last name'
  })
  lastName!: string;

  @EmailField({ 
    description: 'User email address',
    toLowerCase: true
  })
  email!: string;

  @PasswordField(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    description: 'Strong password with special characters'
  })
  password!: string;

  @PhoneField('VN', { 
    description: 'Contact phone number' 
  })
  phone!: string;

  @DateField({ 
    description: 'User birth date' 
  })
  birthDate!: Date;

  @BooleanField({ 
    description: 'Email verification status' 
  })
  isEmailVerified!: boolean;

  @ArrayField(() => String, { 
    description: 'User roles' 
  })
  roles!: string[];

  @UUIDField({ 
    description: 'Organization ID' 
  })
  organizationId!: string;
}

export class UserProfileDto {
  @StringField({ 
    minLength: 2, 
    maxLength: 50 
  })
  firstName!: string;

  @StringField({ 
    minLength: 2, 
    maxLength: 50 
  })
  lastName!: string;

  @EmailField()
  email!: string;

  @PhoneField('VN')
  phone!: string;

  @DateField()
  birthDate!: Date;

  @BooleanField()
  isEmailVerified!: boolean;

  @ArrayField(() => String)
  roles!: string[];

  @ClassField(() => AddressDto)
  address!: AddressDto;
}
```

### Advanced Validation Examples

#### Custom Validators

```typescript
import { 
  StringField, 
  FieldUtils 
} from '@ecom-co/utils';

export class AdvancedUserDto {
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
  password!: string;

  @StringField({
    customValidators: [
      FieldUtils.createCustomValidator(
        'isVietnamesePhone',
        (value: string) => {
          return /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/.test(value);
        },
        'Số điện thoại phải là số điện thoại Việt Nam hợp lệ'
      )
    ]
  })
  phone!: string;
}
```

#### Conditional Validation

```typescript
import { 
  BooleanField, 
  StringField, 
  ConditionalField 
} from '@ecom-co/utils';

export class OrderDto {
  @BooleanField()
  hasDeliveryAddress!: boolean;

  @ConditionalField(
    (obj: OrderDto) => obj.hasDeliveryAddress,
    StringField({
      messages: {
        required: 'Địa chỉ giao hàng là bắt buộc khi hasDeliveryAddress = true'
      }
    })
  )
  deliveryAddress?: string;

  @BooleanField()
  hasSpecialInstructions!: boolean;

  @ConditionalField(
    (obj: OrderDto) => obj.hasSpecialInstructions,
    StringField({
      maxLength: 500,
      messages: {
        required: 'Hướng dẫn đặc biệt là bắt buộc khi hasSpecialInstructions = true'
      }
    })
  )
  specialInstructions?: string;
}
```

## 🛠️ Configuration

### Validation Configuration

```typescript
import { validationPipeConfig } from '@ecom-co/utils';

// In your main.ts
const app = await NestFactory.create(AppModule);

// Setup global validation pipe with custom exception factory
app.useGlobalPipes(validationPipeConfig);

// Or custom configuration
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: validationExceptionFactory,
  })
);
```

### Swagger Configuration

```typescript
import { swaggerConfig } from '@ecom-co/utils';

// In your main.ts
const app = await NestFactory.create(AppModule);

// Enable CORS
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
});

// Global prefix
app.setGlobalPrefix('api/v1');

// Swagger documentation
const document = SwaggerModule.createDocument(app, swaggerConfig);
SwaggerModule.setup('api/docs', app, document);

await app.listen(process.env.PORT || 3000);
```

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/e-commerce-platform-co.git

# Install dependencies
cd libs/utils
npm install

# Run tests
npm test

# Run linting
npm run lint

# Build the project
npm run build
```

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comprehensive JSDoc comments
- Write unit tests for new features
- Follow the existing code structure

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](https://docs.ecom-co.com)
- 🐛 [Bug Reports](https://github.com/your-org/e-commerce-platform-co/issues)
- 💬 [Discussions](https://github.com/your-org/e-commerce-platform-co/discussions)
- 📧 [Email Support](mailto:support@ecom-co.com)

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [class-validator](https://github.com/typestack/class-validator) - Validation library
- [class-transformer](https://github.com/typestack/class-transformer) - Transformation library
- [@nestjs/swagger](https://docs.nestjs.com/openapi/introduction) - API documentation

---

<div align="center">

Made with ❤️ by the E-commerce Platform Team

[Website](https://ecom-co.com) • [Blog](https://blog.ecom-co.com) • [Twitter](https://twitter.com/ecom_co)

</div>
