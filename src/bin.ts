import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import * as Joi from 'joi'
import EmailService from './services/emailService'

export class Bin {
    app: express.Application;
    server: any;
    port: string | number;
    emailService: any;

    constructor() {
        this.emailService = new EmailService();
    }

    protected listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });
    }

    protected createApp(): void {
        this.app = express();
    }

    protected createServer(): void {
        this.server = http.createServer(this.app);
    }

    protected setConfig(): void {
        this.app.use(require('helmet')());
        // use json form parser middlware
        this.app.use(bodyParser.json());
    }

    protected loggerMiddleware(request: express.Request, response: express.Response, next) {
        console.log(`${request.method} ${request.path}`);
        next();
    }


    protected routes(): void {
        const schema = Joi.object().keys({
            to: Joi.string().regex(/^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/),
            cc: Joi.string().regex(/^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/).allow(''),
            bcc: Joi.string().regex(/^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/).allow(''),
            subject: Joi.string().regex(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/).required(),
            body: Joi.string().regex(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/).required(),
        });

        this.app.use((request: express.Request, response: express.Response, next) => {
            console.log(`${request.method} ${request.path} ${request.body}`);
            Joi.validate(request.body, schema, (err, value) => {
                const id = Math.ceil(Math.random() * 9999999);
                if (err) {
                    return response.status(422).json({
                        status: 'error',
                        message: 'Invalid request data',
                        data: { data:request.body, err: err}
                    });
                } else {
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
                    data: { data:request.body }
                });
            }
            catch (err) {
                console.error(err);
            }
        });

    }

    protected async configEmail(): Promise<any> {
        try {
            await this.emailService.buildQueues();
        } catch (error) {
            throw new Error('Failed to initialise email service');
        };
    }
}
