/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import type { NestApplication } from '@nestjs/core';

import type { SwaggerCustomOptions, SwaggerDocumentOptions } from '@nestjs/swagger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Configuration interface for API key authentication.
 */
export interface ApiKeyConfig {
    /** Fallback description for single provider (backward compatibility) */
    description?: string;
    /** Fallback location for single provider */
    in?: ApiKeyLocation;
    /** Fallback key name for single provider */
    keyName?: string;
    /** Array of API key providers */
    providers?: ApiKeyProvider[];
}

/**
 * Individual API key provider configuration.
 */
export interface ApiKeyProvider {
    /** Description of the API key provider */
    description?: string;
    /** Location where the API key is expected */
    in: ApiKeyLocation;
    /** Name of the key parameter */
    keyName: string;
    /** Name of the provider */
    name: string;
}

/**
 * Configuration interface for JWT authentication.
 */
export interface JwtConfig {
    /** Fallback bearer format for single provider */
    bearerFormat?: string;
    /** Fallback description for single provider */
    description?: string;
    /** Array of JWT providers */
    providers?: JwtProvider[];
}

/**
 * Individual JWT provider configuration.
 */
export interface JwtProvider {
    /** Bearer token format */
    bearerFormat?: string;
    /** Description of the JWT provider */
    description?: string;
    /** Name of the provider */
    name: string;
}

/**
 * Configuration interface for OAuth2 authentication.
 */
export interface OAuth2Config {
    /** Fallback authorization URL for single provider */
    authorizationUrl?: string;
    /** Fallback description for single provider */
    description?: string;
    /** Array of OAuth2 providers */
    providers?: OAuth2Provider[];
    /** Fallback scopes for single provider */
    scopes?: Record<string, string>;
    /** Fallback token URL for single provider */
    tokenUrl?: string;
}

/**
 * Individual OAuth2 provider configuration.
 */
export interface OAuth2Provider {
    /** OAuth2 authorization URL */
    authorizationUrl: string;
    /** Description of the OAuth2 provider */
    description?: string;
    /** Name of the provider */
    name: string;
    /** Available OAuth2 scopes */
    scopes: Record<string, string>;
    /** OAuth2 token URL */
    tokenUrl: string;
}

/**
 * Main Swagger configuration options interface.
 */
export interface SwaggerConfigOptions {
    /** API key authentication configuration */
    apiKey?: ApiKeyConfig;
    /** API description */
    description: string;
    /** JWT authentication configuration */
    jwt?: JwtConfig;
    /** Node environment */
    nodeEnv: string;
    /** OAuth2 authentication configuration */
    oauth2?: OAuth2Config;
    /** Application port */
    port: number | string;
    /** Available servers configuration */
    servers?: SwaggerServer[];
    /** API title */
    title: string;
    /** API version */
    version: string;
}

/**
 * Swagger server configuration interface.
 */
export interface SwaggerServer {
    /** Optional description of the server */
    description?: string;
    /** Server URL */
    url: string;
}

/** API key location type for authentication */
type ApiKeyLocation = 'cookie' | 'header' | 'query';

/**
 * Sets up Swagger documentation for a NestJS application.
 * @param {NestApplication} app - The NestJS application instance
 * @param {SwaggerConfigOptions} options - Swagger configuration options
 * @example
 * setUpSwagger(app, {
 *   title: 'My API',
 *   description: 'API documentation',
 *   version: '1.0.0',
 *   nodeEnv: 'development',
 *   port: 3000
 * });
 */
export const setUpSwagger = (app: NestApplication, options: SwaggerConfigOptions) => {
    const { title, apiKey, description, jwt, nodeEnv, oauth2, port, servers, version } = options;

    const documentBuilder = new DocumentBuilder()
        .setTitle(title)
        .setDescription(description)
        .setVersion(version)
        .setContact('Ecom Backend', 'https://example.com', 'admin@ecom.com')
        .setLicense('UNLICENSED', 'https://choosealicense.com/licenses/unlicense/')
        // JWT Bearer Authentication
        .addBearerAuth(
            {
                type: 'http',
                bearerFormat: jwt?.bearerFormat || 'JWT',
                description: jwt?.description || 'JWT access token',
                scheme: 'bearer',
            },
            'bearer',
        )
        // API Key Authentication
        .addApiKey(
            {
                name: apiKey?.keyName || 'api-key',
                type: 'apiKey',
                description: apiKey?.description || 'API Key for authentication',
                in: apiKey?.in || 'header',
            },
            'api-key',
        );

    // Add multiple JWT providers
    if (jwt?.providers) {
        jwt.providers.forEach((provider) => {
            documentBuilder.addBearerAuth(
                {
                    type: 'http',
                    bearerFormat: provider.bearerFormat || 'JWT',
                    description: provider.description || `JWT authentication for ${provider.name}`,
                    scheme: 'bearer',
                },
                provider.name,
            );
        });
    }

    // Add multiple API Key providers
    if (apiKey?.providers) {
        apiKey.providers.forEach((provider) => {
            documentBuilder.addApiKey(
                {
                    name: provider.keyName,
                    type: 'apiKey',
                    description: provider.description || `API Key authentication for ${provider.name}`,
                    in: provider.in,
                },
                provider.name,
            );
        });
    }

    // Add OAuth2 providers
    if (oauth2?.providers) {
        oauth2.providers.forEach((provider) => {
            documentBuilder.addOAuth2(
                {
                    type: 'oauth2',
                    description: provider.description || `OAuth2 authentication for ${provider.name}`,
                    flows: {
                        authorizationCode: {
                            authorizationUrl: provider.authorizationUrl,
                            scopes: provider.scopes,
                            tokenUrl: provider.tokenUrl,
                        },
                        clientCredentials: {
                            scopes: provider.scopes,
                            tokenUrl: provider.tokenUrl,
                        },
                    },
                },
                provider.name,
            );
        });
    } else {
        // Fallback to single provider (backward compatibility)
        documentBuilder.addOAuth2(
            {
                type: 'oauth2',
                description: oauth2?.description || 'OAuth2 authentication with various scopes',
                flows: {
                    authorizationCode: {
                        authorizationUrl: oauth2?.authorizationUrl || 'https://example.com/oauth/authorize',
                        scopes: oauth2?.scopes || {
                            read: 'Read access',
                            'user:read': 'Read user data',
                            'user:write': 'Write user data',
                            write: 'Write access',
                        },
                        tokenUrl: oauth2?.tokenUrl || 'https://example.com/oauth/token',
                    },
                    clientCredentials: {
                        scopes: oauth2?.scopes || {
                            read: 'Read access',
                            write: 'Write access',
                        },
                        tokenUrl: oauth2?.tokenUrl || 'https://example.com/oauth/token',
                    },
                },
            },
            'oauth2',
        );
    }

    documentBuilder
        // Cookie Authentication
        .addCookieAuth('refresh_token', {
            name: 'refresh_token',
            type: 'apiKey',
            description: 'Refresh token stored in httpOnly cookie',
            in: 'cookie',
        })
        // Basic Authentication
        .addBasicAuth(
            {
                type: 'http',
                description: 'Basic authentication with username and password',
                scheme: 'basic',
            },
            'basic',
        )
        .addSecurityRequirements('bearer');

    // Add multiple servers/hosts
    if (servers && servers.length > 0) {
        servers.forEach((server) => {
            documentBuilder.addServer(server.url, server.description);
        });
    } else {
        // Fallback to local server
        documentBuilder.addServer(`http://localhost:${port}`, 'Local');
    }

    documentBuilder.addTag('example', 'Example endpoints').addTag('example-2', 'Second example module');

    const openApiConfig = documentBuilder.build();

    const documentOptions: SwaggerDocumentOptions = {
        deepScanRoutes: true,
        operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
    };

    const document = SwaggerModule.createDocument(app, openApiConfig, documentOptions);

    const topbarHtml = `
      <div id="ecom-topbar" role="banner">
        <div class="ecom-topbar-inner">
          <div class="left">
            <span class="logo" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </span>
            <span class="title">${title}</span>
            <span class="env">(${nodeEnv})</span>
          </div>
          <div class="right">
            <a class="link" href="/docs-json" target="_blank" rel="noreferrer">OpenAPI JSON</a>
            <a class="link" href="/docs-yaml" target="_blank" rel="noreferrer">OpenAPI YAML</a>
            <a class="link" href="/api" target="_blank" rel="noreferrer">API Prefix</a>
          </div>
        </div>
      </div>`;

    const customOptions: SwaggerCustomOptions = {
        // Only customize the topbar; keep default Swagger styles elsewhere
        customCss: `
          .swagger-ui .topbar { display: none; }
          #ecom-topbar, #ecom-topbar * { font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
          #ecom-topbar { position: sticky; top: 0; z-index: 100; color: #e5e7eb; background: linear-gradient(90deg, #0b1220 0%, #111827 100%); backdrop-filter: saturate(160%) blur(8px); border-bottom: 1px solid rgba(255,255,255,.08); }
          #ecom-topbar .ecom-topbar-inner { max-width: 1200px; margin: 0 auto; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; }
          #ecom-topbar .left { display:flex; align-items:center; gap:10px; }
          #ecom-topbar .logo { display:inline-flex; width:20px; height:20px; }
          #ecom-topbar .title { font-weight: 700; letter-spacing: .3px; color:#fff; }
          #ecom-topbar .env { color:#9ca3af; font-size: 12px; margin-left: 4px; }
          #ecom-topbar .right { display:flex; align-items:center; gap:16px; }
          #ecom-topbar .right .link { color: #60a5fa; text-decoration: none; font-weight:600; }
          #ecom-topbar .right .link:hover { color:#93c5fd; text-decoration: underline; }
        `,
        customCssUrl: ['https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap'],
        // Inject custom HTML topbar
        customJsStr: `
          (function(){
            try {
              var container = document.createElement('div');
              container.innerHTML = ${JSON.stringify(topbarHtml)};
              var topbar = container.firstElementChild;
              if (topbar) {
                document.body.insertAdjacentElement('afterbegin', topbar);
              }
            } catch (e) { /* no-op */ }
          })();
        `,
        customSiteTitle: `${title} Docs`,
        swaggerOptions: {
            displayRequestDuration: true,
            docExpansion: 'list',
            filter: true,
            operationsSorter: 'alpha',
            persistAuthorization: true,
            tagsSorter: 'alpha',
        },
    };

    SwaggerModule.setup('docs', app, document, customOptions);
};
