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
class DLExchange {
    constructor(excName) {
        this.excName = excName;
    }
    createConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = process.env.AMQP_URL;
            const conn = yield amqplib.connect(url);
            const channel = yield conn.createChannel();
            return channel.assertExchange(this.excName, 'direct', { durable: true, autoDelete: false });
        });
    }
}
exports.default = DLExchange;
//# sourceMappingURL=exchange.js.map