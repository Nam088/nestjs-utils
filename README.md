# @nam088/nestjs-kit

<div align="center">

[![npm version](https://img.shields.io/npm/v/@nam088/nestjs-kit.svg)](https://www.npmjs.com/package/@nam088/nestjs-kit)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E)](https://nestjs.com/)

A comprehensive utility library for NestJS applications providing decorators, DTOs, filters, pipes, and configurations for building robust REST APIs.

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [API Documentation](#api-documentation)

</div>

---

## 📦 Features

### 🎨 Decorators
- **`@ApiEndpoint`** - Comprehensive Swagger documentation decorator with authentication, validation, pagination, and error handling
- **`@ClampNumber`** - Automatically clamps numeric values between min/max bounds
- **`@ZodBody`, `@ZodParam`, `@ZodQuery`** - Zod schema validation decorators

### 📋 DTOs
- **Standardized Response DTOs** - `ApiResponseDto`, `ErrorResponseDto`, `PaginatedResponseDto`
- **Pagination & Query DTOs** - `PaginationDto`, `QueryDto`, `OrderDto`
- **Type-safe** - Full TypeScript support with generics

### 🛡️ Filters
- **`HttpExceptionFilter`** - Global exception filter with:
  - Automatic error sanitization (remove sensitive data)
  - Request ID tracking & correlation
  - Rate limit tracking
  - Error metrics integration
  - Development/Production modes

### 🔧 Pipes
- **`ZodValidationPipe`** - Validate request data using Zod schemas with detailed error messages

### ⚙️ Configurations
- **`setUpSwagger`** - Elegant Swagger UI setup with custom branding and multiple authentication schemes

### 📊 Constants
- **Authentication Types** - `AUTH_TYPE` (JWT, API Key, OAuth2, Basic, Cookie)
- **Pagination Types** - `PAGINATION_TYPE` (Offset, Cursor)

---

## 🚀 Installation

```bash
npm install @nam088/nestjs-kit
```

### Peer Dependencies

```bash
npm install @nestjs/common@^11 @nestjs/core@^11 @nestjs/swagger@^11 zod@^4
```

---

## 📖 Usage

### 1. Swagger Documentation with `@ApiEndpoint`

The `@ApiEndpoint` decorator provides a powerful way to document your API endpoints with comprehensive Swagger documentation.

#### Basic Usage

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiEndpoint, AUTH_TYPE } from '@nam088/nestjs-kit';
import { HttpStatus } from '@nestjs/common';

@Controller('users')
export class UserController {
  @Get(':id')
  @ApiEndpoint({
    apiUrl: '@GET /api/v1/users/:id',
    summary: 'Get user by ID',
    description: 'Retrieves a single user by their unique identifier',
    tags: ['Users'],
    auth: { type: AUTH_TYPE.JWT, required: true },
    params: [{ name: 'id', type: 'uuid', description: 'User ID' }],
    responses: {
      [HttpStatus.OK]: {
        type: UserDto,
        description: 'User retrieved successfully',
      },
    },
    includeCommonErrors: true,
  })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiEndpoint({
    apiUrl: '@POST /api/v1/users',
    summary: 'Create new user',
    description: 'Creates a new user account',
    tags: ['Users'],
    body: {
      type: CreateUserDto,
      description: 'User creation data',
      required: true,
    },
    responses: {
      [HttpStatus.CREATED]: {
        type: UserDto,
        description: 'User created successfully',
      },
    },
    validation: {
      includeValidationErrors: true,
      errorExamples: [
        { field: 'email', constraint: 'isEmail', message: 'email must be a valid email' },
        { field: 'password', constraint: 'minLength', message: 'password must be at least 8 characters' },
      ],
    },
    includeCommonErrors: true,
  })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
}
```

#### Shorthand Decorators

```typescript
import { ApiGetEndpoint, ApiPostEndpoint, ApiPatchEndpoint, ApiDeleteEndpoint } from '@nam088/nestjs-kit';

// GET endpoint
@Get(':id')
@ApiGetEndpoint({
  apiUrl: '@GET /api/v1/users/:id',
  summary: 'Get user',
  response: UserDto,
  params: [{ name: 'id', type: 'uuid' }],
})
async findOne(@Param('id') id: string) {}

// POST endpoint (automatically sets 201 status)
@Post()
@ApiPostEndpoint({
  apiUrl: '@POST /api/v1/users',
  summary: 'Create user',
  response: UserDto,
  body: { type: CreateUserDto },
})
async create(@Body() dto: CreateUserDto) {}

// DELETE endpoint (automatically sets 204 status)
@Delete(':id')
@ApiDeleteEndpoint({
  apiUrl: '@DELETE /api/v1/users/:id',
  summary: 'Delete user',
  params: [{ name: 'id', type: 'uuid' }],
})
async delete(@Param('id') id: string) {}
```

#### Paginated Endpoints

```typescript
import { ApiPaginatedEndpoint, PAGINATION_TYPE, PaginationDto } from '@nam088/nestjs-kit';

@Get()
@ApiPaginatedEndpoint({
  apiUrl: '@GET /api/v1/users',
  summary: 'List users with pagination',
  tags: ['Users'],
  paginationType: PAGINATION_TYPE.OFFSET,
  responses: {
    [HttpStatus.OK]: {
      type: UserDto,
      isArray: true,
      description: 'Paginated list of users',
    },
  },
})
async findAll(@Query() pagination: PaginationDto) {
  return this.userService.findAll(pagination);
}
```

#### Multiple Authentication Types

```typescript
@Get('protected')
@ApiEndpoint({
  apiUrl: '@GET /api/v1/protected',
  summary: 'Protected endpoint',
  auth: [
    { type: AUTH_TYPE.JWT, required: true, provider: 'access-token' },
    { type: AUTH_TYPE.API_KEY, provider: 'api-key' },
  ],
  responses: {
    [HttpStatus.OK]: { type: DataDto },
  },
})
async protectedRoute() {}
```

---

### 2. Zod Validation

#### Using Zod Decorators

```typescript
import { ZodBody, ZodQuery, ZodParam } from '@nam088/nestjs-kit';
import { z } from 'zod';

// Define Zod schemas
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
});

const userIdSchema = z.object({
  id: z.string().uuid(),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

@Controller('users')
export class UserController {
  @Post()
  async create(@ZodBody(createUserSchema) dto: z.infer<typeof createUserSchema>) {
    return this.userService.create(dto);
  }

  @Get(':id')
  async findOne(@ZodParam(userIdSchema) params: z.infer<typeof userIdSchema>) {
    return this.userService.findOne(params.id);
  }

  @Get()
  async findAll(@ZodQuery(querySchema) query: z.infer<typeof querySchema>) {
    return this.userService.findAll(query);
  }
}
```

#### Using ZodValidationPipe Directly

```typescript
import { ZodValidationPipe } from '@nam088/nestjs-kit';
import { Body } from '@nestjs/common';

@Post()
async create(@Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto) {
  return this.userService.create(dto);
}
```

---

### 3. Response DTOs

#### ApiResponseDto - Standardized Success Responses

```typescript
import { ApiResponseData, ApiResponseDto } from '@nam088/nestjs-kit';
import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

// In your controller - document with Swagger
@Get(':id')
@ApiResponse({
  status: HttpStatus.OK,
  type: ApiResponseDto(UserDto),
})
async findOne(@Param('id') id: string) {
  const user = await this.userService.findOne(id);
  
  // Return standardized response
  return new ApiResponseData({
    data: user,
    message: 'User retrieved successfully',
    statusCode: 200,
  });
}

// Alternative using static factory method
async create(@Body() dto: CreateUserDto) {
  const user = await this.userService.create(dto);
  return ApiResponseData.create(user, 'User created successfully', 201);
}

// For delete operations (null data)
@Delete(':id')
@ApiResponse({
  status: HttpStatus.OK,
  type: ApiResponseDto(null),
})
async delete(@Param('id') id: string) {
  await this.userService.delete(id);
  return new ApiResponseData({
    data: null,
    message: 'User deleted successfully',
    statusCode: 200,
  });
}
```

Response format:
```json
{
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### PaginatedResponseDto - Paginated Responses

```typescript
import { ApiPaginatedResponseDto, PaginationDto } from '@nam088/nestjs-kit';

@Get()
@ApiResponse({
  status: HttpStatus.OK,
  type: ApiPaginatedResponseDto(UserDto),
})
async findAll(@Query() pagination: PaginationDto) {
  const { data, total } = await this.userService.findAll(pagination);
  
  return {
    statusCode: 200,
    message: 'Users retrieved successfully',
    data,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}
```

---

### 4. Global Exception Filter

Set up the global exception filter in your `main.ts`:

```typescript
import { HttpExceptionFilter } from '@nam088/nestjs-kit';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get Reflector instance
  const reflector = app.get(Reflector);
  
  // Apply global exception filter
  app.useGlobalFilters(
    new HttpExceptionFilter(reflector, {
      isDevelopment: process.env.NODE_ENV === 'development',
      enableSanitization: true, // Remove sensitive data in production
      enableMetrics: true, // Track error metrics
      enableRateLimitTracking: true, // Track rate limit violations
      customErrorMessages: {
        404: 'The resource you are looking for does not exist',
        500: 'Something went wrong on our end',
      },
    })
  );

  await app.listen(3000);
}
bootstrap();
```

#### Error Response Format

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    "email must be a valid email",
    "password must be at least 8 characters"
  ],
  "path": "/api/users",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestId": "abc123-def456-ghi789"
}
```

---

### 5. Swagger Configuration

Set up Swagger in your `main.ts`:

```typescript
import { setUpSwagger } from '@nam088/nestjs-kit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure Swagger
  setUpSwagger(app, {
    title: 'My E-commerce API',
    description: 'REST API for e-commerce platform',
    version: '1.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    port: 3000,
    servers: [
      { url: 'http://localhost:3000', description: 'Local' },
      { url: 'https://api.example.com', description: 'Production' },
    ],
    jwt: {
      providers: [
        { name: 'access-token', bearerFormat: 'JWT', description: 'JWT access token' },
        { name: 'refresh-token', bearerFormat: 'JWT', description: 'JWT refresh token' },
      ],
    },
    apiKey: {
      providers: [
        { name: 'api-key', keyName: 'X-API-Key', in: 'header', description: 'API Key for service authentication' },
      ],
    },
  });

  await app.listen(3000);
}
bootstrap();
```

Access Swagger UI at: `http://localhost:3000/docs`

---

### 6. ClampNumber Decorator

Automatically clamp numeric values:

```typescript
import { ClampNumber } from '@nam088/nestjs-kit';

export class CreateProductDto {
  @ClampNumber({ min: 0, max: 100 })
  discount: number; // Will be clamped between 0-100

  @ClampNumber({ min: 1, max: 999999 })
  quantity: number; // Will be clamped between 1-999999
}

// Input: { discount: 150, quantity: -5 }
// After transform: { discount: 100, quantity: 1 }
```

---

## 🎯 Advanced Examples

### Complete CRUD Controller

```typescript
import {
  ApiGetEndpoint,
  ApiPostEndpoint,
  ApiPatchEndpoint,
  ApiDeleteEndpoint,
  ApiPaginatedEndpoint,
  AUTH_TYPE,
  PAGINATION_TYPE,
  PaginationDto,
  ZodBody,
  ZodParam,
  ApiResponseData,
} from '@nam088/nestjs-kit';
import { Controller, Get, Post, Patch, Delete, Query } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { z } from 'zod';

// Zod schemas
const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().min(0),
  description: z.string().optional(),
});

const updateProductSchema = createProductSchema.partial();

const productIdSchema = z.object({
  id: z.string().uuid(),
});

@Controller('products')
export class ProductController {
  @Get()
  @ApiPaginatedEndpoint({
    apiUrl: '@GET /api/v1/products',
    summary: 'List all products',
    tags: ['Products'],
    paginationType: PAGINATION_TYPE.OFFSET,
    queries: [
      { name: 'page', type: 'number', description: 'Page number', example: 1 },
      { name: 'limit', type: 'number', description: 'Items per page', example: 10 },
      { name: 'q', type: 'string', description: 'Search query', required: false },
    ],
    responses: {
      [HttpStatus.OK]: {
        type: ProductDto,
        isArray: true,
        description: 'Products retrieved successfully',
      },
    },
  })
  async findAll(@Query() pagination: PaginationDto) {
    const result = await this.productService.findAll(pagination);
    return result;
  }

  @Get(':id')
  @ApiGetEndpoint({
    apiUrl: '@GET /api/v1/products/:id',
    summary: 'Get product by ID',
    tags: ['Products'],
    params: [{ name: 'id', type: 'uuid', description: 'Product ID' }],
    response: ProductDto,
    includeCommonErrors: true,
  })
  async findOne(@ZodParam(productIdSchema) params: z.infer<typeof productIdSchema>) {
    const product = await this.productService.findOne(params.id);
    return new ApiResponseData({
      data: product,
      message: 'Product retrieved successfully',
    });
  }

  @Post()
  @ApiPostEndpoint({
    apiUrl: '@POST /api/v1/products',
    summary: 'Create new product',
    tags: ['Products'],
    auth: { type: AUTH_TYPE.JWT, required: true },
    body: { type: CreateProductDto, required: true },
    response: ProductDto,
    validation: {
      includeValidationErrors: true,
      errorExamples: [
        { field: 'name', constraint: 'minLength', message: 'name must not be empty' },
        { field: 'price', constraint: 'min', message: 'price must be greater than or equal to 0' },
      ],
    },
    includeCommonErrors: true,
  })
  async create(@ZodBody(createProductSchema) dto: z.infer<typeof createProductSchema>) {
    const product = await this.productService.create(dto);
    return ApiResponseData.create(product, 'Product created successfully', 201);
  }

  @Patch(':id')
  @ApiPatchEndpoint({
    apiUrl: '@PATCH /api/v1/products/:id',
    summary: 'Update product',
    tags: ['Products'],
    auth: { type: AUTH_TYPE.JWT, required: true },
    params: [{ name: 'id', type: 'uuid', description: 'Product ID' }],
    body: { type: UpdateProductDto, required: true },
    response: ProductDto,
    includeCommonErrors: true,
  })
  async update(
    @ZodParam(productIdSchema) params: z.infer<typeof productIdSchema>,
    @ZodBody(updateProductSchema) dto: z.infer<typeof updateProductSchema>,
  ) {
    const product = await this.productService.update(params.id, dto);
    return new ApiResponseData({
      data: product,
      message: 'Product updated successfully',
    });
  }

  @Delete(':id')
  @ApiDeleteEndpoint({
    apiUrl: '@DELETE /api/v1/products/:id',
    summary: 'Delete product',
    tags: ['Products'],
    auth: { type: AUTH_TYPE.JWT, required: true },
    params: [{ name: 'id', type: 'uuid', description: 'Product ID' }],
  })
  async delete(@ZodParam(productIdSchema) params: z.infer<typeof productIdSchema>) {
    await this.productService.delete(params.id);
    return new ApiResponseData({
      data: null,
      message: 'Product deleted successfully',
    });
  }
}
```

---

## 📚 API Documentation

### Decorators

#### `@ApiEndpoint(options)`

Comprehensive API endpoint documentation decorator.

**Options:**
- `apiUrl` (required): API route for tracing (e.g., `@GET /api/v1/users`)
- `summary` (required): Short summary of the endpoint
- `description`: Detailed description
- `tags`: Swagger tags (string or array)
- `auth`: Authentication configuration (single or array)
- `body`: Request body configuration
- `params`: Path parameter configuration
- `queries`: Query parameter configuration
- `responses`: Response configuration by status code
- `errors`: Custom error responses
- `includeCommonErrors`: Auto-include 400, 404, 500 errors
- `validation`: Validation error documentation
- `paginationType`: Pagination type (`PAGINATION_TYPE.OFFSET` or `PAGINATION_TYPE.CURSOR`)
- `deprecated`: Mark endpoint as deprecated

#### `@ClampNumber({ min, max })`

Clamps numeric property values.

#### `@ZodBody(schema)`, `@ZodParam(schema)`, `@ZodQuery(schema)`

Validate request data with Zod schemas.

### DTOs

#### `ApiResponseDto(dataType)`

Factory function for creating typed response DTOs.

#### `ApiResponseData<T>`

Class for creating standardized API responses.

```typescript
new ApiResponseData({
  data: T,
  message?: string,
  statusCode?: number,
})
```

#### `PaginationDto`

Standard pagination query parameters:
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `q` (optional search query)

### Constants

#### `AUTH_TYPE`
- `JWT`: JWT Bearer authentication
- `API_KEY`: API Key authentication
- `OAUTH2`: OAuth2 authentication
- `BASIC`: Basic authentication
- `COOKIE`: Cookie-based authentication

#### `PAGINATION_TYPE`
- `OFFSET`: Offset-based pagination
- `CURSOR`: Cursor-based pagination

---

## 🧪 Testing

The library includes comprehensive test coverage. Run tests:

```bash
npm test
npm run test:coverage
```

---

## 🛠️ Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Watch Mode

```bash
npm run build:watch
```

---

## 📝 License

ISC © [Nam077](https://github.com/Nam088)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

- Repository: [https://github.com/Nam088/nestjs-kit](https://github.com/Nam088/nestjs-kit)
- Issues: [https://github.com/Nam088/nestjs-kit/issues](https://github.com/Nam088/nestjs-kit/issues)
- NPM: [https://www.npmjs.com/package/@nam088/nestjs-kit](https://www.npmjs.com/package/@nam088/nestjs-kit)

---

<div align="center">

**Made with ❤️ for the NestJS community**

</div>

