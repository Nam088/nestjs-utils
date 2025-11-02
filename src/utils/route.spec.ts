import { route } from './route';

import type { ApiRoute, HttpMethod } from '../types/api-route.type';

describe('route', () => {
    describe('basic functionality', () => {
        it('should create correct route strings for all HTTP methods', () => {
            const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

            methods.forEach((method) => {
                const result = route(method, 'test');

                expect(result).toBe(`@${method} test`);
            });
        });

        it('should handle simple paths', () => {
            expect(route('GET', 'users')).toBe('@GET users');
            expect(route('POST', 'auth/login')).toBe('@POST auth/login');
            expect(route('PUT', 'profile')).toBe('@PUT profile');
        });

        it('should handle paths with parameters', () => {
            expect(route('GET', 'users/:id')).toBe('@GET users/:id');
            expect(route('PUT', 'users/:id/profile')).toBe('@PUT users/:id/profile');
            expect(route('DELETE', 'posts/:postId/comments/:commentId')).toBe(
                '@DELETE posts/:postId/comments/:commentId',
            );
        });

        it('should handle API versioned paths', () => {
            expect(route('GET', 'api/v1/users')).toBe('@GET api/v1/users');
            expect(route('POST', 'api/v2/auth/register')).toBe('@POST api/v2/auth/register');
            expect(route('PUT', 'api/v3/products/:id')).toBe('@PUT api/v3/products/:id');
        });
    });

    describe('edge cases', () => {
        it('should handle empty path', () => {
            expect(route('GET', '')).toBe('@GET ');
        });

        it('should handle paths with special characters', () => {
            expect(route('GET', 'users/search?q=test')).toBe('@GET users/search?q=test');
            expect(route('POST', 'files/upload#section')).toBe('@POST files/upload#section');
            expect(route('PUT', 'data/export.json')).toBe('@PUT data/export.json');
        });

        it('should handle paths with spaces', () => {
            expect(route('GET', 'user profile')).toBe('@GET user profile');
            expect(route('POST', 'api/v1/user data')).toBe('@POST api/v1/user data');
        });

        it('should handle very long paths', () => {
            const longPath = 'api/v1/very/long/path/with/many/segments/and/parameters/:id/sub-resources/:subId';

            expect(route('GET', longPath)).toBe(`@GET ${longPath}`);
        });
    });

    describe('real-world scenarios', () => {
        it('should work with RESTful API patterns', () => {
            expect(route('GET', 'api/v1/users')).toBe('@GET api/v1/users');
            expect(route('POST', 'api/v1/users')).toBe('@POST api/v1/users');
            expect(route('GET', 'api/v1/users/:id')).toBe('@GET api/v1/users/:id');
            expect(route('PUT', 'api/v1/users/:id')).toBe('@PUT api/v1/users/:id');
            expect(route('DELETE', 'api/v1/users/:id')).toBe('@DELETE api/v1/users/:id');
        });

        it('should work with nested resources', () => {
            expect(route('GET', 'api/v1/users/:userId/posts')).toBe('@GET api/v1/users/:userId/posts');
            expect(route('POST', 'api/v1/users/:userId/posts')).toBe('@POST api/v1/users/:userId/posts');
            expect(route('GET', 'api/v1/users/:userId/posts/:postId')).toBe('@GET api/v1/users/:userId/posts/:postId');
            expect(route('PUT', 'api/v1/users/:userId/posts/:postId')).toBe('@PUT api/v1/users/:userId/posts/:postId');
            expect(route('DELETE', 'api/v1/users/:userId/posts/:postId')).toBe(
                '@DELETE api/v1/users/:userId/posts/:postId',
            );
        });

        it('should work with authentication routes', () => {
            expect(route('POST', 'api/v1/auth/login')).toBe('@POST api/v1/auth/login');
            expect(route('POST', 'api/v1/auth/register')).toBe('@POST api/v1/auth/register');
            expect(route('POST', 'api/v1/auth/logout')).toBe('@POST api/v1/auth/logout');
            expect(route('POST', 'api/v1/auth/refresh')).toBe('@POST api/v1/auth/refresh');
            expect(route('POST', 'api/v1/auth/forgot-password')).toBe('@POST api/v1/auth/forgot-password');
            expect(route('POST', 'api/v1/auth/reset-password')).toBe('@POST api/v1/auth/reset-password');
        });

        it('should work with file upload routes', () => {
            expect(route('POST', 'api/v1/files/upload')).toBe('@POST api/v1/files/upload');
            expect(route('GET', 'api/v1/files/:id')).toBe('@GET api/v1/files/:id');
            expect(route('DELETE', 'api/v1/files/:id')).toBe('@DELETE api/v1/files/:id');
        });
    });

    describe('type safety', () => {
        it('should return correct ApiRoute type', () => {
            const result: ApiRoute = route('GET', 'test');

            expect(typeof result).toBe('string');
            expect(result).toMatch(/^@(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS) /);
        });

        it('should accept all valid HttpMethod types', () => {
            const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

            methods.forEach((method) => {
                const result = route(method, 'test');

                expect(result).toMatch(new RegExp(`^@${method} test$`));
            });
        });
    });

    describe('integration examples', () => {
        it('should work with e-commerce API routes', () => {
            expect(route('GET', 'api/v1/products')).toBe('@GET api/v1/products');
            expect(route('POST', 'api/v1/products')).toBe('@POST api/v1/products');
            expect(route('GET', 'api/v1/products/:id')).toBe('@GET api/v1/products/:id');
            expect(route('PUT', 'api/v1/products/:id')).toBe('@PUT api/v1/products/:id');
            expect(route('DELETE', 'api/v1/products/:id')).toBe('@DELETE api/v1/products/:id');
            expect(route('GET', 'api/v1/products/:id/reviews')).toBe('@GET api/v1/products/:id/reviews');
            expect(route('POST', 'api/v1/products/:id/reviews')).toBe('@POST api/v1/products/:id/reviews');
        });

        it('should work with blog API routes', () => {
            expect(route('GET', 'api/v1/posts')).toBe('@GET api/v1/posts');
            expect(route('POST', 'api/v1/posts')).toBe('@POST api/v1/posts');
            expect(route('GET', 'api/v1/posts/:id')).toBe('@GET api/v1/posts/:id');
            expect(route('PUT', 'api/v1/posts/:id')).toBe('@PUT api/v1/posts/:id');
            expect(route('DELETE', 'api/v1/posts/:id')).toBe('@DELETE api/v1/posts/:id');
            expect(route('GET', 'api/v1/posts/:id/comments')).toBe('@GET api/v1/posts/:id/comments');
            expect(route('POST', 'api/v1/posts/:id/comments')).toBe('@POST api/v1/posts/:id/comments');
        });

        it('should work with admin API routes', () => {
            expect(route('GET', 'api/v1/admin/users')).toBe('@GET api/v1/admin/users');
            expect(route('PUT', 'api/v1/admin/users/:id/status')).toBe('@PUT api/v1/admin/users/:id/status');
            expect(route('GET', 'api/v1/admin/stats')).toBe('@GET api/v1/admin/stats');
            expect(route('POST', 'api/v1/admin/backup')).toBe('@POST api/v1/admin/backup');
        });
    });
});
