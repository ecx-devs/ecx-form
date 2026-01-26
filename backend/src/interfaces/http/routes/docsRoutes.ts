import { Router, Request, Response } from 'express';
import { swaggerDocument } from '../swagger';

export function createDocsRoutes(): Router {
  const router = Router();

  // Serve OpenAPI JSON spec
  router.get('/openapi.json', (req: Request, res: Response) => {
    res.json(swaggerDocument);
  });

  // Serve Swagger UI HTML
  router.get('/', (req: Request, res: Response) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ECX Forms API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #2699e3; }
    .swagger-ui .info .title small { background: #fab12d; }
    .swagger-ui .opblock-tag { color: #272e4b; }
    .swagger-ui .opblock.opblock-post { border-color: #2699e3; background: rgba(38, 153, 227, 0.1); }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #2699e3; }
    .swagger-ui .opblock.opblock-get { border-color: #00b29a; background: rgba(0, 178, 154, 0.1); }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #00b29a; }
    .swagger-ui .opblock.opblock-put { border-color: #fab12d; background: rgba(250, 177, 45, 0.1); }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #fab12d; }
    .swagger-ui .opblock.opblock-patch { border-color: #6259cd; background: rgba(98, 89, 205, 0.1); }
    .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #6259cd; }
    .swagger-ui .opblock.opblock-delete { border-color: #f2443f; background: rgba(242, 68, 63, 0.1); }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #f2443f; }
    .swagger-ui .btn.execute { background: #2699e3; border-color: #2699e3; }
    .swagger-ui .btn.execute:hover { background: #1e7ab6; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/api/v1/docs/openapi.json",
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        deepLinking: true,
        showExtensions: true,
        showCommonExtensions: true
      });
    };
  </script>
</body>
</html>
    `;
    res.type('html').send(html);
  });

  return router;
}
