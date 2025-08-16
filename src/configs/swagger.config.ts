import { NestApplication } from '@nestjs/core';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

export interface SwaggerConfigOptions {
    port: number | string;
    title: string;
    description: string;
    version: string;
    nodeEnv: string;
    servers?: Array<{
        url: string;
        description?: string;
    }>;
    jwt?: {
        providers?: Array<{
            name: string;
            bearerFormat?: string;
            description?: string;
        }>;
        // Fallback for single provider (backward compatibility)
        bearerFormat?: string;
        description?: string;
    };
    oauth2?: {
        providers?: Array<{
            name: string;
            authorizationUrl: string;
            tokenUrl: string;
            scopes: Record<string, string>;
            description?: string;
        }>;
        // Fallback for single provider (backward compatibility)
        authorizationUrl?: string;
        tokenUrl?: string;
        scopes?: Record<string, string>;
        description?: string;
    };
    apiKey?: {
        providers?: Array<{
            name: string;
            in: 'header' | 'query' | 'cookie';
            keyName: string;
            description?: string;
        }>;
        // Fallback for single provider (backward compatibility)
        in?: 'header' | 'query' | 'cookie';
        keyName?: string;
        description?: string;
    };
}

export const setUpSwagger = (app: NestApplication, options: SwaggerConfigOptions) => {
    const { port, title, description, version, nodeEnv, servers, jwt, oauth2, apiKey } = options;

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
                scheme: 'bearer',
                bearerFormat: jwt?.bearerFormat || 'JWT',
                description: jwt?.description || 'JWT access token',
            },
            'bearer',
        )
        // API Key Authentication
        .addApiKey(
            {
                type: 'apiKey',
                in: apiKey?.in || 'header',
                name: apiKey?.keyName || 'api-key',
                description: apiKey?.description || 'API Key for authentication',
            },
            'api-key',
        );

    // Add multiple JWT providers
    if (jwt?.providers) {
        jwt.providers.forEach((provider) => {
            documentBuilder.addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: provider.bearerFormat || 'JWT',
                    description: provider.description || `JWT authentication for ${provider.name}`,
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
                    type: 'apiKey',
                    in: provider.in,
                    name: provider.keyName,
                    description: provider.description || `API Key authentication for ${provider.name}`,
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
                    flows: {
                        authorizationCode: {
                            authorizationUrl: provider.authorizationUrl,
                            tokenUrl: provider.tokenUrl,
                            scopes: provider.scopes,
                        },
                        clientCredentials: {
                            tokenUrl: provider.tokenUrl,
                            scopes: provider.scopes,
                        },
                    },
                    description: provider.description || `OAuth2 authentication for ${provider.name}`,
                },
                provider.name,
            );
        });
    } else {
        // Fallback to single provider (backward compatibility)
        documentBuilder.addOAuth2(
            {
                type: 'oauth2',
                flows: {
                    authorizationCode: {
                        authorizationUrl: oauth2?.authorizationUrl || 'https://example.com/oauth/authorize',
                        tokenUrl: oauth2?.tokenUrl || 'https://example.com/oauth/token',
                        scopes: oauth2?.scopes || {
                            read: 'Read access',
                            write: 'Write access',
                            'user:read': 'Read user data',
                            'user:write': 'Write user data',
                        },
                    },
                    clientCredentials: {
                        tokenUrl: oauth2?.tokenUrl || 'https://example.com/oauth/token',
                        scopes: oauth2?.scopes || {
                            read: 'Read access',
                            write: 'Write access',
                        },
                    },
                },
                description: oauth2?.description || 'OAuth2 authentication with various scopes',
            },
            'oauth2',
        );
    }

    documentBuilder
        // Cookie Authentication
        .addCookieAuth('refresh_token', {
            type: 'apiKey',
            in: 'cookie',
            name: 'refresh_token',
            description: 'Refresh token stored in httpOnly cookie',
        })
        // Basic Authentication
        .addBasicAuth(
            {
                type: 'http',
                scheme: 'basic',
                description: 'Basic authentication with username and password',
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
        customSiteTitle: `${title} Docs`,
        customCssUrl: ['https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap'],
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
          
          /* Token Selector Styles */
          .token-selector {
            margin: 10px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
            border: 1px solid #e9ecef;
          }
          .token-selector label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #495057;
          }
          .token-selector select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            background: white;
          }
        `,
        // Inject custom HTML topbar and token selector
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
          
          // Add token selector dropdown
          (function() {
            setTimeout(function() {
              const authSection = document.querySelector('.auth-wrapper');
              if (authSection && document.querySelectorAll('.auth-wrapper .auth-container').length > 1) {
                const selector = document.createElement('div');
                selector.innerHTML = \`
                  <div class="token-selector">
                    <label>Select Token Type:</label>
                    <select id="tokenTypeSelect">
                      <option value="access-token">Access Token</option>
                      <option value="admin-token">Admin Token</option>
                    </select>
                  </div>
                \`;
                authSection.appendChild(selector);
              }
            }, 1000);
          })();
        `,
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'list',
            filter: true,
            displayRequestDuration: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    };

    SwaggerModule.setup('docs', app, document, customOptions);
};
