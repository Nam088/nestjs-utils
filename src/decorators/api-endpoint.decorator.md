# ApiEndpoint Decorators (NestJS)

A small utility library of decorators that standardize and simplify Swagger (OpenAPI) documentation for NestJS controllers.  
It provides a single, flexible decorator (`ApiEndpoint`) with many configuration options and several shorthand decorators for common patterns (GET/POST/PAGINATED/AUTH).

This README explains features, installation, usage, configuration options, and examples.

---

## Key features

- Single configuration object to declare operation summary, description, tags, and operationId.
- Flexible response declarations by HTTP status including type, description, examples, headers, and arrays.
- Built-in support for pagination (OFFSET or CURSOR) via existing paginated DTO helpers.
- Multi-auth support: JWT, API Key, OAuth2, Basic, Cookie (auto-adds related security decorators).
- Auto-include common error responses (400, 404, 409, 500, 429) when requested.
- Request body support including multipart file upload (automatically adds `multipart/form-data` schema).
- Query, path params, and header documentation helpers.
- Metadata support for rate limiting, caching, and validation groups via `SetMetadata`.
- Shorthand decorators: `ApiGetEndpoint`, `ApiPostEndpoint`, `ApiPutEndpoint`, `ApiPatchEndpoint`, `ApiDeleteEndpoint`, `ApiPaginatedEndpoint`, `ApiAuthEndpoint`.

---

## Requirements

- Node.js & TypeScript
- NestJS
- @nestjs/swagger
- lodash

The implementation references the following supporting files (you must provide or adapt them to your project):
- `../constants/auth.constants` (AUTH_TYPE, AuthType)
- `../constants/pagination.constants` (PAGINATION_TYPE, PaginationType)
- `../dto/api.response.dto`, `../dto/error.response.dto`, `../dto/paginated.response.dto`

Ensure those DTOs and constants exist or replace them with your own equivalents.

---

## Installation

Install required packages if not already present:

```bash
npm install @nestjs/swagger swagger-ui-express lodash
# or
yarn add @nestjs/swagger swagger-ui-express lodash
```

Copy the decorator implementation into your project (for example `src/common/decorators/api-endpoint.decorator.ts`) and adjust import paths for the DTOs and constants.

---

## Usage example

Basic GET and POST examples using shorthand decorators:

```typescript
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiGetEndpoint, ApiPostEndpoint } from 'src/common/decorators/api-endpoint.decorator';
import { UserDto, CreateUserDto } from './dto';

@Controller('users')
export class UsersController {
  @Get()
  @ApiGetEndpoint({
    summary: 'Get users list',
    description: 'Return a list of users (non-paginated)',
    tags: ['Users'],
    response: { type: UserDto, description: 'List of users', isArray: true },
    queries: [{ name: 'active', type: 'boolean', description: 'Filter active users', required: false }]
  })
  async findAll(@Query('active') active?: boolean) {
    // ...
  }

  @Post()
  @ApiPostEndpoint({
    summary: 'Create user',
    tags: ['Users'],
    auth: { type: [AUTH_TYPE.JWT], required: true },
    body: { type: CreateUserDto, description: 'User creation payload', required: true },
    response: { type: UserDto, description: 'Created user' },
    errors: [{ status: 422, description: 'Invalid email format' }],
    includeCommonErrors: true
  })
  async create(@Body() payload: CreateUserDto) {
    // ...
  }
}
```

---

## ApiEndpointOptions (overview)

The `ApiEndpoint` decorator accepts an options object with the following relevant fields:

- summary: string (required) — short operation summary.
- description?: string — detailed description.
- tags?: string | string[] — Swagger tags.
- deprecated?: boolean — mark operation deprecated.
- operationId?: string — explicit operationId.
- externalDocs?: { description: string; url: string } — external docs link.

- responses?: Partial<Record<HttpStatus, ResponseConfig<T>>> — map of status code to response config.
  - ResponseConfig<T>:
    - type: Type<T> | null
    - description?: string
    - examples?: Record<string, any>
    - headers?: Record<string, any>
    - isArray?: boolean

- paginationType?: PaginationType — use when a response is paginated (applies paginated DTO wrappers).
- auth?: AuthConfig — authentication config:
  - type: AuthType[] (e.g. [AUTH_TYPE.JWT])  
  - apiKeyName?: string  
  - cookieName?: string  
  - oauth2Scopes?: string[]  
  - required?: boolean (default true)

- body?: BodyConfig — request body config:
  - type?: Type<any>
  - description?: string
  - required?: boolean
  - examples?: Record<string, any>
  - files?: Array<{ name: string; description?: string; required?: boolean; isArray?: boolean }>
    - If `files` is provided, decorator adds `ApiConsumes('multipart/form-data')` and generates a schema for the file fields.

- queries?: QueryConfig[] — query parameters:
  - QueryConfig: { name, type?: 'string'|'number'|'boolean'|'array', description?, required?, example?, enum? }

- params?: ParamConfig[] — path parameters:
  - ParamConfig: { name, type?: 'string'|'number'|'uuid', description?, example?, format? }

- headers?: HeaderConfig[] — header parameters:
  - HeaderConfig: { name, description?, required?, example? }

- consumes?: string[] — content types the endpoint consumes.
- produces?: string[] — content types the endpoint produces.

- errors?: (HttpStatus | CustomErrorConfig)[] — custom error responses.  
  - CustomErrorConfig: { status: HttpStatus, description?: string, type?: Type<any>, examples?: Record<string, any> }

- includeCommonErrors?: boolean — include common error responses (400, 404, 409, 500, 429).
- rateLimit?: { limit: number, window: string, message?: string } — stored via `SetMetadata('rateLimit', ...)`; auto-adds 429 response if not present.
- cache?: { ttl?: number, description?: string } — stored via `SetMetadata('cacheTtl', ttl)`.
- validation?: { groups?: string[] } — stored via `SetMetadata('validationGroups', groups)`.

---

## Advanced examples

1) File upload (multipart/form-data):

```typescript
@ApiPostEndpoint({
  summary: 'Upload avatar',
  tags: ['Users'],
  auth: { type: [AUTH_TYPE.JWT] },
  body: {
    description: 'Upload an avatar file',
    files: [
      { name: 'avatar', description: 'Avatar image file', required: true, isArray: false }
    ]
  },
  response: { type: null, description: 'Uploaded' },
})
uploadAvatar(@UploadedFile() file: Express.Multer.File) {
  // ...
}
```

2) Paginated endpoint (OFFSET pagination):

```typescript
@ApiGetEndpoint({
  summary: 'Get users (paginated)',
  tags: ['Users'],
  paginationType: PAGINATION_TYPE.OFFSET,
  response: { type: UserDto },
  queries: [
    { name: 'page', type: 'number', required: false, example: 1 },
    { name: 'limit', type: 'number', required: false, example: 20 }
  ]
})
findAllPaginated() { /* ... */ }
```

3) Rate limit metadata with automatic 429 response:

```typescript
@ApiGetEndpoint({
  summary: 'Rate limited endpoint',
  tags: ['Demo'],
  response: { type: String },
  rateLimit: { limit: 100, window: '1h', message: 'Too many requests' },
})
rateLimited() { /* ... */ }
```

---

## Shorthand decorators

- ApiGetEndpoint, ApiPostEndpoint, ApiPutEndpoint, ApiPatchEndpoint, ApiDeleteEndpoint  
  - These provide default response status codes (200 / 201 / 200 / 200 / 204 respectively) when `response` is passed.

- ApiPaginatedEndpoint  
  - Shortcut for paginated endpoints — accepts `paginationType`.

- ApiAuthEndpoint  
  - Shortcut that requires `auth` configuration and automatically includes common errors.

---

## Integration notes

- Make sure to register Swagger module in your Nest bootstrap and declare authentication schemes there as needed:

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('API')
  .setDescription('API documentation')
  .setVersion('1.0')
  .addBearerAuth() // if using bearer
  // .addApiKey(), .addOAuth2(), etc. as needed
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

- Ensure DTOs used as `type` (e.g., `UserDto`, `ErrorResponseDto`, paginated DTOs) are decorated with `@ApiProperty()` so Swagger can generate schema information properly.

---

## Troubleshooting

- If Swagger is not showing expected schemas:
  - Confirm the `type` values are exported classes (not interfaces or plain objects).
  - Verify DTOs contain `@ApiProperty()` decorators.
  - For paginated responses, ensure `ApiPaginatedResponseDto` and `ApiCursorPaginatedResponseDto` return proper classes or schemas.

- For multipart file uploads:
  - The decorator creates a body schema with `format: 'binary'` for file fields. Integrate with `@UseInterceptors(FileInterceptor(...))` or `FilesInterceptor(...)` from NestJS.

---

## Extending and customizing

- Add new auth types by updating `createAuthDecorators`.
- Modify paginated wrappers via `getPaginatedType`.
- Add custom metadata keys or additional auto-responses by editing the decorator implementation.

---

## Contributing

Contributions are welcome. Possible improvements:
- Add more fine-grained content negotiation support.
- Better typing and validation for the options object.
- Additional shorthand decorators for common response shapes.

Please open an issue or PR in your repository.

---

## License

Choose a license for your project, e.g. MIT.