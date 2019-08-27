import * as express from "express";
import EmailRoute from "./emailRoute";

export default class Router {
  public add(app: express.Application): any {
    // Base url
    app.use("/", EmailRoute);
  }
}
