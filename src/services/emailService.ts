import EmailQueues from "../rabbitmq/queues";
import DLExchange from "../rabbitmq/exchange";
import MailGun from './../thirdPartyVendor/providerMailGun';
import SendGrid from './../thirdPartyVendor/providerSendGrid';

const formatEmailAddress = (data) => {
    if(data){
        return data.split(',').map((email) => email.trim()).join(',');
    }
};

export default class EmailService {
    sendGrid: EmailQueues;
    mailGun: EmailQueues;

  async buildQueues() {
    const dlx = new DLExchange('DLX');
    await dlx.createConnection();

    this.mailGun = new EmailQueues('DLX', new MailGun(), 'q.mailgun', 6000, 1 );
    this.sendGrid = new EmailQueues('DLX', new SendGrid(), 'q.sendgrid', 6000, 1 );

    await this.mailGun.createConnection();
    await this.sendGrid.createConnection();
    return;
  }

  send(input) {

    // Normalise data for each mail provider
    const data = {
      to: formatEmailAddress(input.to),
      cc: formatEmailAddress(input.cc),
      bcc: formatEmailAddress(input.bcc),
      from: 'sandippagi@gmail.com',
      subject: input.subject,
      text: input.body,
    };

  try {
      this.sendGrid.sendToQueue(data);
      return;
  } catch (error) {
      console.error(error);
  }

  try {
      this.mailGun.sendToQueue(data);
      return;
  } catch (error) {
      console.error(error);
  }


    throw new Error('No email providers closed');
  }
}
