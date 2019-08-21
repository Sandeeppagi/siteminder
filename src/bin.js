System.register(["body-parser", "express", "http", "./email-providers/resilient-email-provider"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (this && this.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var bodyParser, express_1, http, resilient_email_provider_1, Bin;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (bodyParser_1) {
                bodyParser = bodyParser_1;
            },
            function (express_1_1) {
                express_1 = express_1_1;
            },
            function (http_1) {
                http = http_1;
            },
            function (resilient_email_provider_1_1) {
                resilient_email_provider_1 = resilient_email_provider_1_1;
            }
        ],
        execute: function () {
            Bin = /** @class */ (function () {
                function Bin() {
                }
                Bin.prototype.listen = function () {
                    var _this = this;
                    this.server.listen(this.port, function () {
                        console.log('Running server on port %s', _this.port);
                    });
                };
                Bin.prototype.createApp = function () {
                    console.log('app created');
                    this.app = express_1.default();
                };
                Bin.prototype.createServer = function () {
                    this.server = http.createServer(this.app);
                };
                Bin.prototype.setConfig = function () {
                    this.app.set('view options', { pretty: false });
                    this.app.use(require('helmet')());
                    this.app.disable('x-powered-by');
                    this.app.set('etag', false);
                    // use json form parser middlware
                    this.app.use(bodyParser.json());
                    // use query string parser middlware
                    this.app.use(bodyParser.urlencoded({
                        extended: true,
                    }));
                    this.app.use(require('compression')());
                    this.app.use(require('response-time')());
                };
                Bin.prototype.initEmail = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("Called");
                                    this.email = new resilient_email_provider_1.default();
                                    return [4 /*yield*/, this.email.init()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                Bin.prototype.anyting = function () {
                    console.log("Called !!");
                };
                return Bin;
            }());
            exports_1("Bin", Bin);
        }
    };
});
//# sourceMappingURL=bin.js.map