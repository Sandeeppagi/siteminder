import * as amqplib from "amqplib";

export default class CircuitBreaker {
  private static qnameMG: string = "mailgun-2";
  private static qnameSG: string = "sendgrid-2";
  private qname: string;
  private vendor: any;
  private dlxExchangeName: string;
  private dlxQueueName: string;
  private channel: any;
  private retry: number;
  private circuit: string;
  private badRequest: number;
  private failedTime: any;
  private threshHold: number;

  constructor(dlxExchangeName, vendor, qname, retry, threshHoldFailure) {
    this.dlxExchangeName = dlxExchangeName;
    this.vendor = vendor;
    this.qname = qname;
    this.dlxQueueName = `${dlxExchangeName}.${qname}`;
    this.channel = null;
    this.retry = retry;
    this.threshHold = threshHoldFailure;
    this.resetCircuit();
  }

  public async createConnection() {
    const url = process.env.AMQP_LOCAL || process.env.AMQP_URL;
    const conn = await amqplib.connect(url);

    this.channel = await conn.createChannel();

    await this.producer();
    await this.consumers();
  }

  public async producer() {
    await this.channel.assertQueue(this.dlxQueueName, { durable: true });

    (await this.isQueueMG())
      ? await this.channel.bindQueue(
        this.dlxQueueName,
        this.dlxExchangeName,
        CircuitBreaker.qnameSG,
      )
      : await this.channel.bindQueue(
        this.dlxQueueName,
        this.dlxExchangeName,
        CircuitBreaker.qnameMG,
      );

    await this.channel.assertQueue(this.qname, {
      deadLetterExchange: this.dlxExchangeName,
      deadLetterRoutingKey: this.qname,
      durable: true,
    });
    await this.channel.bindQueue(this.qname, this.dlxExchangeName, this.qname);
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
          this.checkCircuit();
          // this.channel.nack(msg);
          await this.handleRejectedMessages(msg);
        }
      }
    });

    await this.channel.consume(this.dlxQueueName, async (msg) => {
      if (msg !== null) {
        try {
          // console.info("Processing", this.qname);
          await this.switchVendor(msg);
        } catch (err) {
          this.checkCircuit();
          await this.channel.nack(msg);
        }
      }
    });
  }

  public async sendToQueue(email) {
    this.updateCircuit();
    if (this.circuit === "OPEN") {
      throw new Error("Circuit open");
    } else {
      return this.channel.sendToQueue(
        this.qname,
        Buffer.from(JSON.stringify(email)),
      );
    }
  }

  private async handleRejectedMessages(msg) {
    // ack original msg
    this.channel.ack(msg);

    let content: any = JSON.parse(msg.content.toString("utf8"));
    content = Buffer.from(JSON.stringify(content));
    await this.channel.sendToQueue(this.dlxQueueName, content);
  }

  private async switchVendor(msg) {
    // ack original msg
    this.channel.ack(msg);

    let content: any = JSON.parse(msg.content.toString("utf8"));
    content = Buffer.from(JSON.stringify(content));

    (await this.isQueueMG())
      ? await this.channel.sendToQueue(CircuitBreaker.qnameSG, content)
      : await this.channel.sendToQueue(CircuitBreaker.qnameMG, content);
  }

  private async isQueueMG() {
    if (this.qname === CircuitBreaker.qnameMG) {
      return true;
    }
  }

  private updateCircuit() {
    if (this.badRequest > this.threshHold) {
      if (Date.now() - this.failedTime > this.retry) {
        this.circuit = "HALF-OPEN";
      } else {
        this.circuit = "OPEN";
      }
    } else {
      this.resetCircuit();
    }
  }

  private checkCircuit() {
    this.badRequest += 1;
    this.failedTime = Date.now();

    if (this.circuit === "HALF-OPEN") {
      this.circuit = "OPEN";
    }
  }

  private resetCircuit() {
    this.circuit = "CLOSED";
    this.badRequest = 0;
    this.failedTime = null;
  }
}
