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
const bodyParser = require("body-parser");
const express = require("express");
const http = require("http");
const Joi = require("joi");
const emailService_1 = require("./services/emailService");
class Bin {
    constructor() {
        this.emailService = new emailService_1.default();
    }
    listen() {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });
    }
    createApp() {
        this.app = express();
    }
    createServer() {
        this.server = http.createServer(this.app);
    }
    setConfig() {
        this.app.use(require('helmet')());
        // use json form parser middlware
        this.app.use(bodyParser.json());
    }
    loggerMiddleware(request, response, next) {
        console.log(`${request.method} ${request.path}`);
        next();
    }
    routes() {
        const schema = Joi.object().keys({
            to: Joi.string().regex(/^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/),
            cc: Joi.string().regex(/^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/).allow(''),
            bcc: Joi.string().regex(/^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/).allow(''),
            subject: Joi.string().regex(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/).required(),
            body: Joi.string().regex(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/).required(),
        });
        this.app.use((request, response, next) => {
            console.log(`${request.method} ${request.path} ${request.body}`);
            Joi.validate(request.body, schema, (err, value) => {
                const id = Math.ceil(Math.random() * 9999999);
                if (err) {
                    return response.status(422).json({
                        status: 'error',
                        message: 'Invalid request data',
                        data: { data: request.body, err: err }
                    });
                }
                else {
                    next();
                }
            });
        });
        this.app.post('/email', (request, response) => {
            try {
                this.emailService.send(request.body);
                response.status(200).json({
                    status: 'Success',
                    message: 'Email Sent',
                    data: { data: request.body }
                });
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    configEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.emailService.buildQueues();
            }
            catch (error) {
                throw new Error('Failed to initialise email service');
            }
            ;
        });
    }
}
exports.Bin = Bin;
//# sourceMappingURL=bin.js.map