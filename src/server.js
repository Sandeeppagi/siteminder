System.register(["./bin", "dotenv"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var bin_1, dotenv, Server;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (bin_1_1) {
                bin_1 = bin_1_1;
            },
            function (dotenv_1) {
                dotenv = dotenv_1;
            }
        ],
        execute: function () {
            dotenv.config();
            Server = /** @class */ (function (_super) {
                __extends(Server, _super);
                function Server() {
                    var _this = _super.call(this) || this;
                    // create expressjs application
                    _this.createApp();
                    // set Port
                    _this.setPort();
                    // configure application
                    _this.setConfig();
                    // Create http server
                    _this.createServer();
                    // Start server
                    _this.listen();
                    // Init Email Service
                    _this.initEmail();
                    return _this;
                }
                Server.bootstrap = function () {
                    process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
                    return new Server();
                };
                Server.prototype.setPort = function () {
                    // Set port
                    this.port = process.env.PORT || 3000;
                };
                return Server;
            }(bin_1.Bin));
            exports_1("Server", Server);
            exports_1("default", Server.bootstrap().app);
        }
    };
});
//# sourceMappingURL=server.js.map