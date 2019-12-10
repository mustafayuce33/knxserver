import * as express from 'express';
import * as fs from 'fs';
import * as jsyaml from 'js-yaml';

var swaggerTools = require('swagger-tools');

var spec = fs.readFileSync(__dirname + '/api/swagger.json', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);
swaggerDoc.host = "localhost:3025";
swaggerDoc.schemes = ["http"];

export function initSwagger(app: express.Application, callbackFn: (err: any) => any): void {
    // Initialize the Swagger middleware
    swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
        // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
        app.use(middleware.swaggerMetadata());

        // Validate Swagger requests
        app.use(middleware.swaggerValidator({
            validateResponse: false
        }));

        // Route validated requests to appropriate controller
        app.use(middleware.swaggerRouter({// swaggerRouter configuration
            swaggerUi: '/api/swagger.json',
            controllers: __dirname + '/api/v1/controllers',
            useStubs: true // Conditionally turn on stubs (mock mode)
        }));

        // Serve the Swagger documents and Swagger UI
        app.use(middleware.swaggerUi());

        app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {

            if (res.headersSent) {
                return next(err);
            } else {
                res.status(err.statusCode || 500).json(err.body || err.message || err || "something blew up and the err object was undefined");
            }
        });

        callbackFn(null);
    });
}