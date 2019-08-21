"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib = require("amqplib");
class EmailQueues {
    constructor(DLExchange, vendor, qname, retry, threshHoldFailure) {
        this.DLExchange = DLExchange;
        this.vendor = vendor;
        this.qname = qname;
        this.retry = retry;
        this.threshHoldFailure = threshHoldFailure;
        this.dLQueue = `${DLExchange}.${qname}`;
        this.channel = null;
        this.reset();
    }
    createConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = process.env.AMQP_URL;
            const conn = yield amqplib.connect(url);
            this.channel = yield conn.createChannel();
            yield this.producer();
            yield this.consumers();
        });
    }
    producer() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.channel.assertQueue(this.dLQueue, { durable: true });
            yield this.channel.bindQueue(this.dLQueue, this.DLExchange, this.qname);
            yield this.channel.assertQueue(this.qname, {
                deadLetterExchange: this.DLExchange,
                deadLetterRoutingKey: this.qname,
                durable: true,
            });
        });
    }
    consumers() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.channel.consume(this.qname, (msg) => __awaiter(this, void 0, void 0, function* () {
                if (msg !== null) {
                    try {
                        const emailData = JSON.parse(msg.content.toString('utf8'));
                        yield this.vendor.sendEmail(emailData);
                        this.channel.ack(msg);
                        console.info('Email sent', emailData);
                    }
                    catch (err) {
                        console.error('Email failed', this.qname, err);
                        this.checkCircuit();
                        this.channel.reject(msg, { requeue: false });
                    }
                }
            }));
            yield this.channel.consume(this.dLQueue, (msg) => __awaiter(this, void 0, void 0, function* () {
                if (msg !== null) {
                    try {
                        console.info('Processing', this.qname);
                        this.checkCircuit();
                    }
                    catch (err) {
                        yield this.channel.reject(msg);
                    }
                }
            }));
        });
    }
    updateState() {
        // Set the current state of our circuit breaker
        if (this.failureCount > this.threshHoldFailure) {
            if ((Date.now() - this.lastFailureTime) > this.retry) {
                this.state = 'HALF-OPEN';
            }
            else {
                this.state = 'OPEN';
            }
        }
        else {
            this.reset();
        }
    }
    checkCircuit() {
        this.failureCount += 1;
        this.lastFailureTime = Date.now();
        if (this.state === 'HALF-OPEN') {
            this.state = 'OPEN';
        }
    }
    reset() {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.lastFailureTime = null;
    }
    sendToQueue(email) {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateState();
            if (this.state === 'OPEN') {
                throw new Error('Circuit open');
            }
            return this.channel.sendToQueue(this.qname, Buffer.from(JSON.stringify(email)));
        });
    }
}
exports.default = EmailQueues;
//# sourceMappingURL=queues.js.map