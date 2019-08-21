import {Bin} from './bin';
import * as dotenv from 'dotenv';
dotenv.config();

export class Server extends Bin {

  public static bootstrap(): Server {
    process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
    return new Server();
  }

  constructor() {
    super();
    // create expressjs application
    this.createApp();

    // set Port
    this.setPort();

    // configure application
    this.setConfig();

    // Create http server
    this.createServer();

    // Start server
    this.listen();

    // Config Email Service
    this.configEmail();

    // Routes
    this.routes();
  }

  setPort() {
    // Set port
    this.port = process.env.PORT || 3000;
  }


}

export default Server.bootstrap().app;
