import { NextFunction, Request, Response } from "express";
import * as Joi from "joi";
import EmailService from "./../services/sendEmailService";
import BaseRoute from "./route";

export class EmailRouter extends BaseRoute {
  private emailService: EmailService;

  constructor() {
    super();
  }

  public init() {
    const schema = Joi.object().keys({
      bcc: Joi.string()
        .regex(
          /^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/
        )
        .allow(""),
      body: Joi.string()
        .regex(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/)
        .required(),
      cc: Joi.string()
        .regex(
          /^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/
        )
        .allow(""),
      subject: Joi.string()
        .regex(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/)
        .required(),
      to: Joi.string().regex(
        /^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/
      ),
    });

    this.router.use(
      (request: Request, response: Response, next: NextFunction) => {
        // console.log(`${request.method} ${request.path} ${request.body}`);
        Joi.validate(request.body, schema, (err, value) => {
          const id = Math.ceil(Math.random() * 9999999);
          if (err) {
            return response.status(422).json({
              data: { data: request.body, err },
              message: "Invalid request data",
              status: "error",
            });
          } else {
            next();
          }
        });
      }
    );

    this.router.post(
      "/email",
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          console.log("/email api called");
          this.emailService = EmailService.getInstance();
          await this.emailService.send(request.body);
          response.status(200).json({
            data: { data: request.body },
            message: "Email Sent",
            status: "Success"
          });
        } catch (err) {
          console.error(err);
          response.status(500).json({
            data: { data: request.body },
            message: "Email Sent",
            status: "Failure"
          });
        }
      }
    );
  }
}

const emailRoute = new EmailRouter();
emailRoute.init();

export default emailRoute.router;
