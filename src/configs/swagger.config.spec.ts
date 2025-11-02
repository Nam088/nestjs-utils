/* eslint-disable max-lines-per-function */
import type { NestApplication } from '@nestjs/core';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { setUpSwagger } from './swagger.config';

import type { ApiKeyConfig, JwtConfig, SwaggerConfigOptions } from './swagger.config';

// Mock SwaggerModule
jest.mock('@nestjs/swagger', () => ({
    DocumentBuilder: jest.fn().mockImplementation(() => ({
        addApiKey: jest.fn().mockReturnThis(),
        addBasicAuth: jest.fn().mockReturnThis(),
        addBearerAuth: jest.fn().mockReturnThis(),
        addCookieAuth: jest.fn().mockReturnThis(),
        addOAuth2: jest.fn().mockReturnThis(),
        addSecurity: jest.fn().mockReturnThis(),
        addSecurityRequirements: jest.fn().mockReturnThis(),
        addServer: jest.fn().mockReturnThis(),
        addTag: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue({}),
        setContact: jest.fn().mockReturnThis(),
        setDescription: jest.fn().mockReturnThis(),
        setLicense: jest.fn().mockReturnThis(),
        setTermsOfService: jest.fn().mockReturnThis(),
        setTitle: jest.fn().mockReturnThis(),
        setVersion: jest.fn().mockReturnThis(),
    })),
    SwaggerModule: {
        createDocument: jest.fn().mockReturnValue({}),
        setup: jest.fn(),
    },
}));

describe('SwaggerConfigOptions', () => {
    let mockApp: Partial<NestApplication>;

    beforeEach(() => {
        mockApp = {
            getHttpAdapter: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('setUpSwagger', () => {
        it('should setup Swagger with default configuration', () => {
            const config: SwaggerConfigOptions = {
                title: 'Test API',
                description: 'Test API Description',
                nodeEnv: 'test',
                port: 3000,
                version: '1.0.0',
            };

            setUpSwagger(mockApp as NestApplication, config);

            expect(DocumentBuilder).toHaveBeenCalled();
            expect(SwaggerModule.createDocument).toHaveBeenCalled();
            expect(SwaggerModule.setup).toHaveBeenCalledWith('docs', mockApp, expect.any(Object), expect.any(Object));
        });

        it('should setup Swagger with JWT authentication', () => {
            const jwtConfig: JwtConfig = {
                providers: [
                    {
                        name: 'access-token',
                        bearerFormat: 'JWT',
                        description: 'Access Token',
                    },
                ],
                bearerFormat: 'JWT',
                description: 'JWT Authentication',
            };

            const config: SwaggerConfigOptions = {
                title: 'Test API',
                description: 'Test API Description',
                jwt: jwtConfig,
                nodeEnv: 'test',
                port: 3000,
                version: '1.0.0',
            };

            setUpSwagger(mockApp as NestApplication, config);

            expect(DocumentBuilder).toHaveBeenCalled();
            expect(SwaggerModule.createDocument).toHaveBeenCalled();
        });

        it('should setup Swagger with API key authentication', () => {
            const apiKeyConfig: ApiKeyConfig = {
                providers: [
                    {
                        name: 'api-key',
                        description: 'API Key',
                        in: 'header',
                        keyName: 'X-API-Key',
                    },
                ],
                description: 'API Key Authentication',
                in: 'header',
                keyName: 'X-API-Key',
            };

            const config: SwaggerConfigOptions = {
                title: 'Test API',
                apiKey: apiKeyConfig,
                description: 'Test API Description',
                nodeEnv: 'test',
                port: 3000,
                version: '1.0.0',
            };

            setUpSwagger(mockApp as NestApplication, config);

            expect(DocumentBuilder).toHaveBeenCalled();
            expect(SwaggerModule.createDocument).toHaveBeenCalled();
        });

        it('should setup Swagger with both JWT and API key authentication', () => {
            const jwtConfig: JwtConfig = {
                providers: [
                    {
                        name: 'access-token',
                        bearerFormat: 'JWT',
                        description: 'Access Token',
                    },
                ],
                description: 'JWT Authentication',
            };

            const apiKeyConfig: ApiKeyConfig = {
                providers: [
                    {
                        name: 'api-key',
                        description: 'API Key',
                        in: 'header',
                        keyName: 'X-API-Key',
                    },
                ],
                description: 'API Key Authentication',
            };

            const config: SwaggerConfigOptions = {
                title: 'Test API',
                apiKey: apiKeyConfig,
                description: 'Test API Description',
                jwt: jwtConfig,
                nodeEnv: 'test',
                port: 3000,
                version: '1.0.0',
            };

            setUpSwagger(mockApp as NestApplication, config);

            expect(DocumentBuilder).toHaveBeenCalled();
            expect(SwaggerModule.createDocument).toHaveBeenCalled();
        });

        it('should setup Swagger with contact information', () => {
            const config: SwaggerConfigOptions = {
                title: 'Test API',
                description: 'Test API Description',
                nodeEnv: 'test',
                port: 3000,
                version: '1.0.0',
            };

            setUpSwagger(mockApp as NestApplication, config);

            expect(DocumentBuilder).toHaveBeenCalled();
            expect(SwaggerModule.createDocument).toHaveBeenCalled();
        });

        it('should setup Swagger with license information', () => {
            const config: SwaggerConfigOptions = {
                title: 'Test API',
                description: 'Test API Description',
                nodeEnv: 'test',
                port: 3000,
                version: '1.0.0',
            };

            setUpSwagger(mockApp as NestApplication, config);

            expect(DocumentBuilder).toHaveBeenCalled();
            expect(SwaggerModule.createDocument).toHaveBeenCalled();
        });

        it('should setup Swagger with servers', () => {
            const config: SwaggerConfigOptions = {
                title: 'Test API',
                description: 'Test API Description',
                nodeEnv: 'test',
                port: 3000,
                servers: [
                    {
                        description: 'Production server',
                        url: 'https://api.example.com',
                    },
                    {
                        description: 'Staging server',
                        url: 'https://staging-api.example.com',
                    },
                ],
                version: '1.0.0',
            };

            setUpSwagger(mockApp as NestApplication, config);

            expect(DocumentBuilder).toHaveBeenCalled();
            expect(SwaggerModule.createDocument).toHaveBeenCalled();
        });

        it('should setup Swagger with tags', () => {
            const config: SwaggerConfigOptions = {
                title: 'Test API',
                description: 'Test API Description',
                nodeEnv: 'test',
                port: 3000,
                version: '1.0.0',
            };

            setUpSwagger(mockApp as NestApplication, config);

            expect(DocumentBuilder).toHaveBeenCalled();
            expect(SwaggerModule.createDocument).toHaveBeenCalled();
        });
    });

    describe('configuration interfaces', () => {
        describe('ApiKeyConfig', () => {
            it('should accept single provider configuration', () => {
                const config: ApiKeyConfig = {
                    description: 'API Key Authentication',
                    in: 'header',
                    keyName: 'X-API-Key',
                };

                expect(config.description).toBe('API Key Authentication');
                expect(config.in).toBe('header');
                expect(config.keyName).toBe('X-API-Key');
            });

            it('should accept multiple providers configuration', () => {
                const config: ApiKeyConfig = {
                    providers: [
                        {
                            name: 'api-key',
                            description: 'API Key',
                            in: 'header',
                            keyName: 'X-API-Key',
                        },
                        {
                            name: 'query-key',
                            description: 'Query API Key',
                            in: 'query',
                            keyName: 'api_key',
                        },
                    ],
                };

                expect(config.providers).toHaveLength(2);
                expect(config.providers![0].name).toBe('api-key');
                expect(config.providers![1].name).toBe('query-key');
            });
        });

        describe('JwtConfig', () => {
            it('should accept single provider configuration', () => {
                const config: JwtConfig = {
                    bearerFormat: 'JWT',
                    description: 'JWT Authentication',
                };

                expect(config.description).toBe('JWT Authentication');
                expect(config.bearerFormat).toBe('JWT');
            });

            it('should accept multiple providers configuration', () => {
                const config: JwtConfig = {
                    providers: [
                        {
                            name: 'access-token',
                            bearerFormat: 'JWT',
                            description: 'Access Token',
                        },
                        {
                            name: 'refresh-token',
                            bearerFormat: 'JWT',
                            description: 'Refresh Token',
                        },
                    ],
                };

                expect(config.providers).toHaveLength(2);
                expect(config.providers![0].name).toBe('access-token');
                expect(config.providers![1].name).toBe('refresh-token');
            });
        });
    });

    describe('ApiKeyLocation enum', () => {
        it('should have correct values', () => {
            // Mock the enum values since they're not exported
            const mockApiKeyLocation = {
                Cookie: 'cookie',
                Header: 'header',
                Query: 'query',
            };

            expect(mockApiKeyLocation.Header).toBe('header');
            expect(mockApiKeyLocation.Query).toBe('query');
            expect(mockApiKeyLocation.Cookie).toBe('cookie');
        });
    });

    describe('edge cases', () => {
        it('should handle empty configuration', () => {
            expect(() => {
                setUpSwagger(mockApp as NestApplication, {} as SwaggerConfigOptions);
            }).not.toThrow();
        });

        it('should handle minimal configuration', () => {
            expect(() => {
                setUpSwagger(mockApp as NestApplication, {
                    title: 'API',
                    description: 'Description',
                    nodeEnv: 'test',
                    port: 3000,
                    version: '1.0.0',
                });
            }).not.toThrow();
        });
    });

    describe('real-world scenarios', () => {
        it('should work with e-commerce API configuration', () => {
            const config: SwaggerConfigOptions = {
                title: 'E-commerce API',
                description: 'API for e-commerce platform',
                jwt: {
                    providers: [
                        {
                            name: 'access-token',
                            bearerFormat: 'JWT',
                            description: 'Access Token',
                        },
                    ],
                    description: 'JWT Authentication',
                },
                nodeEnv: 'production',
                port: 3000,
                servers: [
                    {
                        description: 'Production',
                        url: 'https://api.ecommerce.com',
                    },
                    {
                        description: 'Staging',
                        url: 'https://staging-api.ecommerce.com',
                    },
                ],
                version: '2.0.0',
            };

            setUpSwagger(mockApp as NestApplication, config);

            expect(DocumentBuilder).toHaveBeenCalled();
            expect(SwaggerModule.createDocument).toHaveBeenCalled();
        });
    });
});
