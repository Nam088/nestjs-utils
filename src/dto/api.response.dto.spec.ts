/* eslint-disable max-lines-per-function */
import { ApiResponseData, ApiResponseDto } from './api.response.dto';

// Mock DTO for testing
class UserDto {
    id!: number;
    name!: string;
    email!: string;
}

describe('ApiResponseData', () => {
    describe('constructor', () => {
        it('should create instance with all properties', () => {
            const response = new ApiResponseData({
                data: { id: 1, name: 'John' },
                message: 'Success',
                statusCode: 200,
            });

            expect(response.data).toEqual({ id: 1, name: 'John' });
            expect(response.message).toBe('Success');
            expect(response.statusCode).toBe(200);
        });

        it('should use default message when not provided', () => {
            const response = new ApiResponseData({
                data: { id: 1 },
            });

            expect(response.message).toBe('Success');
        });

        it('should use default statusCode when not provided', () => {
            const response = new ApiResponseData({
                data: { id: 1 },
            });

            expect(response.statusCode).toBe(200);
        });

        it('should use both defaults when only data provided', () => {
            const response = new ApiResponseData({
                data: { id: 1 },
            });

            expect(response.message).toBe('Success');
            expect(response.statusCode).toBe(200);
        });

        it('should handle null data', () => {
            const response = new ApiResponseData({
                data: null,
                message: 'Deleted successfully',
                statusCode: 204,
            });

            expect(response.data).toBeNull();
            expect(response.message).toBe('Deleted successfully');
            expect(response.statusCode).toBe(204);
        });

        it('should handle array data', () => {
            const response = new ApiResponseData({
                data: [{ id: 1 }, { id: 2 }],
                message: 'Users retrieved',
                statusCode: 200,
            });

            expect(response.data).toHaveLength(2);
            expect(response.data).toEqual([{ id: 1 }, { id: 2 }]);
        });

        it('should handle string data', () => {
            const response = new ApiResponseData({
                data: 'test string',
            });

            expect(response.data).toBe('test string');
        });

        it('should handle number data', () => {
            const response = new ApiResponseData({
                data: 42,
            });

            expect(response.data).toBe(42);
        });

        it('should handle boolean data', () => {
            const response = new ApiResponseData({
                data: true,
            });

            expect(response.data).toBe(true);
        });
    });

    describe('create static method', () => {
        it('should create instance with all parameters', () => {
            const response = ApiResponseData.create({ id: 1, name: 'John' }, 'User created', 201);

            expect(response.data).toEqual({ id: 1, name: 'John' });
            expect(response.message).toBe('User created');
            expect(response.statusCode).toBe(201);
        });

        it('should use default message when not provided', () => {
            const response = ApiResponseData.create({ id: 1 });

            expect(response.message).toBe('Success');
        });

        it('should use default statusCode when not provided', () => {
            const response = ApiResponseData.create({ id: 1 });

            expect(response.statusCode).toBe(200);
        });

        it('should handle null data', () => {
            const response = ApiResponseData.create(null, 'Deleted', 204);

            expect(response.data).toBeNull();
        });

        it('should return ApiResponseData instance', () => {
            const response = ApiResponseData.create({ id: 1 });

            expect(response).toBeInstanceOf(ApiResponseData);
        });
    });

    describe('real-world scenarios', () => {
        it('should work for successful GET request', () => {
            const userData = { id: 1, name: 'John Doe', email: 'john@example.com' };
            const response = new ApiResponseData({
                data: userData,
                message: 'User retrieved successfully',
                statusCode: 200,
            });

            expect(response.statusCode).toBe(200);
            expect(response.data).toEqual(userData);
        });

        it('should work for successful POST request', () => {
            const newUser = { id: 2, name: 'Jane Doe', email: 'jane@example.com' };
            const response = new ApiResponseData({
                data: newUser,
                message: 'User created successfully',
                statusCode: 201,
            });

            expect(response.statusCode).toBe(201);
            expect(response.data).toEqual(newUser);
        });

        it('should work for successful DELETE request', () => {
            const response = new ApiResponseData({
                data: null,
                message: 'User deleted successfully',
                statusCode: 200,
            });

            expect(response.statusCode).toBe(200);
            expect(response.data).toBeNull();
        });

        it('should work for successful PUT request', () => {
            const updatedUser = { id: 1, name: 'John Updated', email: 'john@example.com' };
            const response = new ApiResponseData({
                data: updatedUser,
                message: 'User updated successfully',
                statusCode: 200,
            });

            expect(response.statusCode).toBe(200);
            expect(response.data).toEqual(updatedUser);
        });

        it('should work for list retrieval', () => {
            const users = [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' },
                { id: 3, name: 'Bob' },
            ];
            const response = new ApiResponseData({
                data: users,
                message: 'Users retrieved successfully',
                statusCode: 200,
            });

            expect(response.statusCode).toBe(200);
            expect(response.data).toHaveLength(3);
        });
    });

    describe('status codes', () => {
        it('should handle 200 OK', () => {
            const response = new ApiResponseData({
                data: {},
                statusCode: 200,
            });

            expect(response.statusCode).toBe(200);
        });

        it('should handle 201 Created', () => {
            const response = new ApiResponseData({
                data: {},
                statusCode: 201,
            });

            expect(response.statusCode).toBe(201);
        });

        it('should handle 204 No Content', () => {
            const response = new ApiResponseData({
                data: null,
                statusCode: 204,
            });

            expect(response.statusCode).toBe(204);
        });

        it('should handle 202 Accepted', () => {
            const response = new ApiResponseData({
                data: {},
                statusCode: 202,
            });

            expect(response.statusCode).toBe(202);
        });
    });

    describe('custom messages', () => {
        it('should support custom success messages', () => {
            const response = new ApiResponseData({
                data: {},
                message: 'Operation completed successfully',
            });

            expect(response.message).toBe('Operation completed successfully');
        });

        it('should support detailed messages', () => {
            const response = new ApiResponseData({
                data: {},
                message: 'User profile updated. Email verification sent.',
            });

            expect(response.message).toBe('User profile updated. Email verification sent.');
        });

        it('should support short messages', () => {
            const response = new ApiResponseData({
                data: {},
                message: 'OK',
            });

            expect(response.message).toBe('OK');
        });
    });
});

describe('ApiResponseDto', () => {
    describe('factory function', () => {
        it('should create a class for typed responses', () => {
            const UserResponseDto = ApiResponseDto(UserDto);

            expect(UserResponseDto).toBeDefined();
            expect(typeof UserResponseDto).toBe('function');
        });

        it('should create a class for null responses', () => {
            const DeleteResponseDto = ApiResponseDto(null);

            expect(DeleteResponseDto).toBeDefined();
            expect(typeof DeleteResponseDto).toBe('function');
        });

        it('should create instances with correct properties', () => {
            const UserResponseDto = ApiResponseDto(UserDto);
            const response = new UserResponseDto();

            expect(response).toHaveProperty('data');
            expect(response).toHaveProperty('message');
            expect(response).toHaveProperty('statusCode');
        });

        it('should allow setting data property', () => {
            const UserResponseDto = ApiResponseDto(UserDto);
            const response = new UserResponseDto();

            response.data = { id: 1, name: 'John', email: 'john@example.com' };

            expect(response.data).toBeDefined();
            expect(response.data).toHaveProperty('id');
            expect(response.data).toHaveProperty('name');
            expect(response.data).toHaveProperty('email');
        });

        it('should allow setting null data', () => {
            const DeleteResponseDto = ApiResponseDto(null);
            const response = new DeleteResponseDto();

            response.data = null;

            expect(response.data).toBeNull();
        });

        it('should allow setting message', () => {
            const UserResponseDto = ApiResponseDto(UserDto);
            const response = new UserResponseDto();

            response.message = 'User retrieved successfully';

            expect(response.message).toBe('User retrieved successfully');
        });

        it('should allow setting statusCode', () => {
            const UserResponseDto = ApiResponseDto(UserDto);
            const response = new UserResponseDto();

            response.statusCode = 200;

            expect(response.statusCode).toBe(200);
        });
    });

    describe('class naming', () => {
        it('should generate unique class name with data type', () => {
            const UserResponseDto = ApiResponseDto(UserDto);

            expect(UserResponseDto.name).toBe('ApiResponseOfUserDto');
        });

        it('should generate unique class name for null type', () => {
            const DeleteResponseDto = ApiResponseDto(null);

            expect(DeleteResponseDto.name).toBe('ApiResponseOfNull');
        });

        it('should create different classes for different types', () => {
            class ProductDto {
                id!: number;
                name!: string;
            }

            const UserResponseDto = ApiResponseDto(UserDto);
            const ProductResponseDto = ApiResponseDto(ProductDto);

            expect(UserResponseDto.name).not.toBe(ProductResponseDto.name);
            expect(UserResponseDto.name).toBe('ApiResponseOfUserDto');
            expect(ProductResponseDto.name).toBe('ApiResponseOfProductDto');
        });
    });

    describe('real-world scenarios', () => {
        it('should work for user endpoint response', () => {
            const UserResponseDto = ApiResponseDto(UserDto);
            const response = new UserResponseDto();

            response.data = { id: 1, name: 'John Doe', email: 'john@example.com' };
            response.message = 'User retrieved successfully';
            response.statusCode = 200;

            expect(response.data).toBeDefined();
            expect(response.message).toBe('User retrieved successfully');
            expect(response.statusCode).toBe(200);
        });

        it('should work for delete endpoint response', () => {
            const DeleteResponseDto = ApiResponseDto(null);
            const response = new DeleteResponseDto();

            response.data = null;
            response.message = 'User deleted successfully';
            response.statusCode = 200;

            expect(response.data).toBeNull();
            expect(response.message).toBe('User deleted successfully');
            expect(response.statusCode).toBe(200);
        });

        it('should work for list endpoint response', () => {
            class UserListDto {
                users!: UserDto[];
            }

            const ListResponseDto = ApiResponseDto(UserListDto);
            const response = new ListResponseDto();

            response.data = {
                users: [
                    { id: 1, name: 'John', email: 'john@example.com' },
                    { id: 2, name: 'Jane', email: 'jane@example.com' },
                ],
            };
            response.message = 'Users retrieved successfully';
            response.statusCode = 200;

            expect(response.data).toBeDefined();
            expect(response.data.users).toHaveLength(2);
        });
    });

    describe('type safety', () => {
        it('should create instances of correct type', () => {
            const UserResponseDto = ApiResponseDto(UserDto);
            const response = new UserResponseDto();

            expect(response).toBeInstanceOf(UserResponseDto);
        });

        it('should allow creating multiple instances', () => {
            const UserResponseDto = ApiResponseDto(UserDto);
            const response1 = new UserResponseDto();
            const response2 = new UserResponseDto();

            expect(response1).toBeInstanceOf(UserResponseDto);
            expect(response2).toBeInstanceOf(UserResponseDto);
            expect(response1).not.toBe(response2);
        });
    });
});
