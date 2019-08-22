import * as sdk from '@sendgrid/mail';

export default class SendGrid {

    constructor() {
        sdk.setApiKey(process.env.SENDGRID_KEY);
    }

    public async sendEmail(data) {
        console.log("Email sent SG");
        sdk.send(data);
    }

}