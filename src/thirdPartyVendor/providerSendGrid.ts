import * as lib from "@sendgrid/mail";
import HttpCall from "./../services/httpRequest";

export default class SendGrid {
    private httpCall: HttpCall;

    constructor() {
        lib.setApiKey(process.env.SENDGRID_KEY);
    }

    public async sendEmail(data) {
        // console.log("Email via SG");

        // Call using axioms
        // this.httpCall = new HttpCall(
        //     process.env.SENDGRID_URL,
        //     process.env.SENDGRID_KEY,
        // );
        // return this.httpCall.postCall(data);

        // Call using sendgrid lib
        return lib.send(data);
    }
}
