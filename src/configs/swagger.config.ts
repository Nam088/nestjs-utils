import { NestApplication } from '@nestjs/core';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

export interface SwaggerConfigOptions {
    port: number | string;
    title: string;
    description: string;
    version: string;
    nodeEnv: string;
}

export const setUpSwagger = (app: NestApplication, options: SwaggerConfigOptions) => {
    const { port, title, description, version, nodeEnv } = options;

    const documentBuilder = new DocumentBuilder()
        .setTitle(title)
        .setDescription(description)
        .setVersion(version)
        .setContact('Ecom Backend', 'https://example.com', 'admin@ecom.com')
        .setLicense('UNLICENSED', 'https://choosealicense.com/licenses/unlicense/')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT access token',
            },
            'bearer',
        )
        .addCookieAuth('refresh_token', {
            type: 'apiKey',
            in: 'cookie',
            name: 'refresh_token',
            description: 'Refresh token stored in httpOnly cookie',
        })
        .addSecurityRequirements('bearer')
        .addServer(`http://localhost:${port}`, 'Local')
        .addTag('example', 'Example endpoints')
        .addTag('example-2', 'Second example module');

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
        `,
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
