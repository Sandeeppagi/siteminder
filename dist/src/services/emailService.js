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
const queues_1 = require("../rabbitmq/queues");
const exchange_1 = require("../rabbitmq/exchange");
const providerMailGun_1 = require("./../thirdPartyVendor/providerMailGun");
const providerSendGrid_1 = require("./../thirdPartyVendor/providerSendGrid");
const formatEmailAddress = (data) => {
    if (data) {
        return data.split(',').map((email) => email.trim()).join(',');
    }
};
class EmailService {
    buildQueues() {
        return __awaiter(this, void 0, void 0, function* () {
            const dlx = new exchange_1.default('DLX');
            yield dlx.createConnection();
            this.mailGun = new queues_1.default('DLX', new providerMailGun_1.default(), 'q.mailgun', 6000, 1);
            this.sendGrid = new queues_1.default('DLX', new providerSendGrid_1.default(), 'q.sendgrid', 6000, 1);
            yield this.mailGun.createConnection();
            yield this.sendGrid.createConnection();
            return;
        });
    }
    send(input) {
        // Normalise data for each mail provider
        const data = {
            to: formatEmailAddress(input.to),
            cc: formatEmailAddress(input.cc),
            bcc: formatEmailAddress(input.bcc),
            from: 'sandippagi@gmail.com',
            subject: input.subject,
            text: input.body,
        };
        try {
            this.sendGrid.sendToQueue(data);
            return;
        }
        catch (error) {
            console.error(error);
        }
        try {
            this.mailGun.sendToQueue(data);
            return;
        }
        catch (error) {
            console.error(error);
        }
        throw new Error('No email providers closed');
    }
}
exports.default = EmailService;
//# sourceMappingURL=emailService.js.map