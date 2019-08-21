System.register(["amqplib"], function (exports_1, context_1) {
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
    var amqplib_1, CircuitBreaker;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (amqplib_1_1) {
                amqplib_1 = amqplib_1_1;
            }
        ],
        execute: function () {
            // This class implements a basic Circuit braker
            // pattern it follows as described by this article: https://martinfowler.com/bliki/CircuitBreaker.html
            // TODO: - Add a failed message back to the top level queue for processing
            //       - Move the circuit state to an external datastore, so our consumers can be stateless.
            CircuitBreaker = /** @class */ (function () {
                function CircuitBreaker(queueName, processEmail, deadLetterExchange, failureThreshHold, retryTimoutMs) {
                    this.queueName = queueName;
                    this.deadLetterExchange = deadLetterExchange;
                    this.deadLetterQueue = deadLetterExchange + "." + queueName;
                    this.channel = null;
                    this.processEmail = processEmail;
                    this.retryTimoutMs = retryTimoutMs;
                    this.failureThreshHold = failureThreshHold;
                    this.reset();
                }
                CircuitBreaker.prototype.init = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var url, conn, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    url = process.env.CLOUDAMQP_URL || 'amqp://localhost';
                                    return [4 /*yield*/, amqplib_1.default.connect(url)];
                                case 1:
                                    conn = _b.sent();
                                    _a = this;
                                    return [4 /*yield*/, conn.createChannel()];
                                case 2:
                                    _a.channel = _b.sent();
                                    return [4 /*yield*/, this.setQueues()];
                                case 3:
                                    _b.sent();
                                    return [4 /*yield*/, this.setConsumers()];
                                case 4:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                CircuitBreaker.prototype.setQueues = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                // Bind dlx
                                return [4 /*yield*/, this.channel.assertQueue(this.deadLetterQueue)];
                                case 1:
                                    // Bind dlx
                                    _a.sent();
                                    return [4 /*yield*/, this.channel.bindQueue(this.deadLetterQueue, this.deadLetterExchange, this.queueName)];
                                case 2:
                                    _a.sent();
                                    // Add queue for current email provider
                                    return [4 /*yield*/, this.channel.assertQueue(this.queueName, {
                                            deadLetterExchange: this.deadLetterExchange,
                                            deadLetterRoutingKey: this.queueName,
                                            durable: true,
                                        })];
                                case 3:
                                    // Add queue for current email provider
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                CircuitBreaker.prototype.setConsumers = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                // Handle new emails on the queue
                                return [4 /*yield*/, this.channel.consume(this.queueName, function (msg) { return __awaiter(_this, void 0, void 0, function () {
                                        var emailData, err_1;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!(msg !== null)) return [3 /*break*/, 4];
                                                    _a.label = 1;
                                                case 1:
                                                    _a.trys.push([1, 3, , 4]);
                                                    emailData = JSON.parse(msg.content.toString('utf8'));
                                                    return [4 /*yield*/, this.processEmail(emailData)];
                                                case 2:
                                                    _a.sent();
                                                    this.channel.ack(msg);
                                                    console.info('Processed email', emailData);
                                                    return [3 /*break*/, 4];
                                                case 3:
                                                    err_1 = _a.sent();
                                                    console.error('Email sending failed', this.queueName, err_1);
                                                    this.recordFailure();
                                                    this.channel.reject(msg, { requeue: false });
                                                    return [3 /*break*/, 4];
                                                case 4: return [2 /*return*/];
                                            }
                                        });
                                    }); })];
                                case 1:
                                    // Handle new emails on the queue
                                    _a.sent();
                                    // Handle any errors on the deadLetterQueue
                                    return [4 /*yield*/, this.channel.consume(this.deadLetterQueue, function (msg) { return __awaiter(_this, void 0, void 0, function () {
                                            var err_2;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!(msg !== null)) return [3 /*break*/, 4];
                                                        _a.label = 1;
                                                    case 1:
                                                        _a.trys.push([1, 2, , 4]);
                                                        console.info('Dead letter queue processing', this.queueName);
                                                        // Here we record the failure, it can be caused by the consumer at runtime.
                                                        this.recordFailure();
                                                        return [3 /*break*/, 4];
                                                    case 2:
                                                        err_2 = _a.sent();
                                                        return [4 /*yield*/, this.channel.reject(msg)];
                                                    case 3:
                                                        _a.sent();
                                                        return [3 /*break*/, 4];
                                                    case 4: return [2 /*return*/];
                                                }
                                            });
                                        }); })];
                                case 2:
                                    // Handle any errors on the deadLetterQueue
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                CircuitBreaker.prototype.updateState = function () {
                    // Set the current state of our circuit breaker
                    if (this.failureCount > this.failureThreshHold) {
                        if ((Date.now() - this.lastFailureTime) > this.retryTimoutMs) {
                            this.state = 'HALF-OPEN';
                        }
                        else {
                            this.state = 'OPEN';
                        }
                    }
                    else {
                        this.reset();
                    }
                };
                CircuitBreaker.prototype.recordFailure = function () {
                    // Set counters for failure
                    this.failureCount += 1;
                    this.lastFailureTime = Date.now();
                    // If our state is half open, and a single failure happens, we open the circuit.
                    if (this.state === 'HALF-OPEN') {
                        this.state = 'OPEN';
                    }
                };
                // Reset our circuit breaker state, to closed and reset our failures
                CircuitBreaker.prototype.reset = function () {
                    this.state = 'CLOSED';
                    this.failureCount = 0;
                    this.lastFailureTime = null;
                };
                CircuitBreaker.prototype.sendToQueue = function (email) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            this.updateState();
                            if (this.state === 'OPEN') {
                                throw new Error('Circuit open');
                            }
                            return [2 /*return*/, this.channel.sendToQueue(this.queueName, new Buffer(JSON.stringify(email)))];
                        });
                    });
                };
                return CircuitBreaker;
            }());
            exports_1("default", CircuitBreaker);
        }
    };
});
//# sourceMappingURL=circuit-breaker.js.map