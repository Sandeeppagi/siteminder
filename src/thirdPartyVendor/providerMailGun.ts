import * as sdk from 'mailgun-js';


export default class MailGun {
    mailgun: any;

    constructor() {
        this.mailgun = sdk({ apiKey: process.env.MAILGUN_KEY, domain: 'www.google.com' });
    }

    public async sendEmail(data){
        console.log("Email sent MG");
        return this.mailgun.messages().send(data);
    }
}

