# Unit Tests for ZodValidationPipe

This directory contains comprehensive unit tests for the `ZodValidationPipe` class.

## Test Coverage

The test suite covers the following scenarios:

### ✅ Valid Data Scenarios
- Valid object with all required fields
- Valid object with optional fields
- Primitive values (strings, numbers)
- Arrays
- Nested objects
- Union types
- Enum validation
- Complex real-world schemas

### ❌ Invalid Data Scenarios
- Invalid object structure
- Missing required fields
- Validation rule violations (min/max, email format, etc.)
- Wrong data types
- Invalid enum values

### 🚫 Edge Cases
- `null` values
- `undefined` values
- Empty objects
- Non-ZodError exceptions
- Different metadata types

## Running Tests

### Prerequisites
Make sure you have installed the testing dependencies:

```bash
npm install
```

### Available Test Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (no watch, with coverage)
npm run test:ci
```

## Test Structure

The test file (`zod-validation.pipe.spec.ts`) is organized into the following sections:

1. **Constructor Tests** - Testing pipe instantiation
2. **Transform Method Tests** - Core functionality testing
   - Valid data scenarios
   - Invalid data scenarios
   - Null/undefined handling
   - Non-ZodError exception handling
   - Edge cases
3. **Integration Tests** - Real-world usage scenarios

## Test Examples

### Basic Usage Test
```typescript
it('should return parsed data for valid input', () => {
  const validData = {
    name: 'John Doe',
    age: 25,
    email: 'john@example.com',
  };

  const result = pipe.transform(validData, mockMetadata);

  expect(result).toEqual(validData);
});
```

### Error Handling Test
```typescript
it('should throw BadRequestException for invalid data', () => {
  const invalidData = {
    name: 123, // should be string
    age: 'not a number', // should be number
  };

  expect(() => pipe.transform(invalidData, mockMetadata)).toThrow(
    BadRequestException,
  );
});
```

## Configuration

The tests use Jest with the following configuration:
- **Preset**: `ts-jest` for TypeScript support
- **Environment**: Node.js
- **Test Pattern**: `**/*.spec.ts` and `**/*.test.ts`
- **Coverage**: Excludes test files and type definitions
- **Timeout**: 10 seconds

## Contributing

When adding new tests:
1. Follow the existing naming conventions
2. Group related tests using `describe` blocks
3. Use descriptive test names that explain the scenario
4. Include both positive and negative test cases
5. Test edge cases and error conditions
6. Ensure tests are isolated and don't depend on each other
