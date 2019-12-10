import * as express from "express";
import * as http from 'http';
import * as cors from 'cors';

class HttpServer {
    private _app: express.Application;
    private _server: http.Server;

    constructor() {
        this._app = express();
        this._app.use(cors());
    }

    public get app(): express.Application {
        return this._app;
    }

    public async startApiServer() {

        this._server = http.createServer(this._app);

        this._server.listen("3025", function () {
            console.info('HTTP%s is listening on port %d (http%s://localhost:%d)', "", "3025", "", "3025");
            console.info('Swagger-ui is available on http%s://localhost:%d/api-docs', "", "3025");
        });
    };
}

export const httpServer = new HttpServer();