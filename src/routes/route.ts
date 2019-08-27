import { Router } from "express";

export default class BaseRoute {
  public router: Router;

  constructor() {
    this.router = Router();
  }
}
