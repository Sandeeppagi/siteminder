import * as lib from "mailgun-js";
import HttpCall from "./../services/httpRequest";

export default class MailGun {
  private mailgun: any;
  private httpCall: HttpCall;

  constructor() {
    this.mailgun = lib({
      apiKey: process.env.MAILGUN_KEY,
      domain: "www.google.com",
    });
  }

  public async sendEmail(data) {
    console.log("Email via MG");

    // Call using axioms
    this.httpCall = new HttpCall(
      process.env.MAILGUN_URL,
      process.env.MAILGUN_KEY,
    );
    return this.httpCall.postCall(data);

    // Call using mailgun lib
    // return this.mailgun.messages().send(data);
  }
}
