"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bin_1 = require("./bin");
const dotenv = require("dotenv");
dotenv.config();
class Server extends bin_1.Bin {
    static bootstrap() {
        process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
        return new Server();
    }
    constructor() {
        super();
        // create expressjs application
        this.createApp();
        // set Port
        this.setPort();
        // configure application
        this.setConfig();
        // Create http server
        this.createServer();
        // Start server
        this.listen();
        // Config Email Service
        this.configEmail();
        // Routes
        this.routes();
    }
    setPort() {
        // Set port
        this.port = process.env.PORT || 3000;
    }
}
exports.Server = Server;
exports.default = Server.bootstrap().app;
//# sourceMappingURL=server.js.map