import * as bodyParser from "body-parser";
import * as express from "express";
import * as http from "http";
import Router from "./routes/baseRoute";
import EmailService from "./services/sendEmailService";

export class Bin {
  public app: express.Application;
  protected port: string | number;
  private emailService: any;
  private server: any;
  private router: any;

  constructor() {
    this.emailService = EmailService.getInstance();
  }

  protected listen(): void {
    this.server.listen(this.port, () => {
      console.log("Running server on port %s", this.port);
    });
  }

  protected createApp(): void {
    this.app = express();
  }

  protected createServer(): void {
    this.server = http.createServer(this.app);
  }

  protected setConfig(): void {
    this.app.use(require("helmet")());
    // use json form parser middlware
    this.app.use(bodyParser.json());
  }

  protected async configEmail(): Promise<any> {
    try {
      await this.emailService.buildQueues();
    } catch (error) {
      console.log("Failed to initialise email service" + error);
    }
  }

  protected routesExtracted(): any {
    this.router = new Router();
    this.router.add(this.app, this.emailService);
  }
}
