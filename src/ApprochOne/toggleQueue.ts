import * as amqplib from "amqplib";

export default class EmailQueues {
  private static qnameMG: string = "mailgun-1";
  private static qnameSG: string = "sendgrid-1";
  private qname: string;
  private vendor: any;
  private directExchangeName: string;
  private channel: any;

  constructor(directExchangeName, vendor, qname) {
    this.directExchangeName = directExchangeName;
    this.vendor = vendor;
    this.qname = qname;
    this.channel = null;
  }

  public async createConnection() {
    const url = process.env.AMQP_LOCAL || process.env.AMQP_URL;
    const conn = await amqplib.connect(url);

    this.channel = await conn.createChannel();

    await this.producer();
    await this.consumers();
  }

  public async producer() {
    await this.channel.assertQueue(this.qname);
    await this.channel.bindQueue(this.qname, this.directExchangeName, this.qname);
  }

  public async consumers() {
    await this.channel.consume(this.qname, async (msg) => {
      if (msg !== null) {
        try {
          const emailData = JSON.parse(msg.content.toString("utf8"));
          await this.vendor.sendEmail(emailData);
          this.channel.ack(msg);
          // console.info("Email sent", emailData);
        } catch (err) {
          // console.error("Email failed", this.qname, err);
          await this.handleRejectedMessages(msg);
        }
      }
    });
  }

  public async sendToQueue(email) {
    return this.channel.sendToQueue(
      this.qname,
      Buffer.from(JSON.stringify(email)),
    );
  }

  private async handleRejectedMessages(msg) {
    // ack original msg
    this.channel.ack(msg);

    let content: any = JSON.parse(msg.content.toString("utf8"));
    content = Buffer.from(JSON.stringify(content));

    if (this.qname === EmailQueues.qnameMG) {
      await this.channel.sendToQueue(EmailQueues.qnameSG, content);
    }

    if (this.qname === EmailQueues.qnameSG) {
      await this.channel.sendToQueue(EmailQueues.qnameMG, content);
    }
  }
}
