import * as amqplib from "amqplib";

export default class CircuitBreaker {
  private qname: string;
  private vendor: any;
  private dlxExchangeName: string;
  private threshHoldFailure: number;
  private retry: number;
  private dLQueue: string;
  private channel: any;
  private state: string;
  private failureCount: number;
  private lastFailureTime: any;

  constructor(dlxExchangeName, vendor, qname, retry, threshHoldFailure) {
    this.dlxExchangeName = dlxExchangeName;
    this.vendor = vendor;
    this.qname = qname;
    this.retry = retry;
    this.threshHoldFailure = threshHoldFailure;
    this.dLQueue = `${dlxExchangeName}.${qname}`;
    this.channel = null;
    this.reset();
  }

  public async createConnection() {
    const url = process.env.AMQP_LOCAL || process.env.AMQP_URL;
    const conn = await amqplib.connect(url);

    this.channel = await conn.createChannel();

    await this.producer();
    await this.consumers();
  }

  public async producer() {
    await this.channel.assertQueue(this.dLQueue, { durable: true });
    await this.channel.bindQueue(this.dLQueue, this.dlxExchangeName, this.qname);

    await this.channel.assertQueue(this.qname, {
      deadLetterExchange: this.dlxExchangeName,
      deadLetterRoutingKey: this.qname,
      durable: true,
    });
  }

  public async consumers() {
    await this.channel.consume(this.qname, async msg => {
      if (msg !== null) {
        try {
          const emailData = JSON.parse(msg.content.toString("utf8"));
          await this.vendor.sendEmail(emailData);
          this.channel.ack(msg);
          console.info("Email sent", emailData);
        } catch (err) {
          console.error("Email failed", this.qname, err);
          this.checkCircuit();
          this.channel.nack(msg, { requeue: true });
        }
      }
    });

    await this.channel.consume(this.dLQueue, async msg => {
      if (msg !== null) {
        try {
          console.info("Processing", this.qname);
          this.checkCircuit();
        } catch (err) {
          await this.channel.nack(msg);
        }
      }
    });
  }

  public async sendToQueue(email) {
    this.updateState();
    if (this.state === "OPEN") {
      throw new Error("Circuit open");
    }
    return this.channel.sendToQueue(
      this.qname,
      Buffer.from(JSON.stringify(email)),
    );
  }

  private updateState() {
    // Set the current state of our circuit breaker
    if (this.failureCount > this.threshHoldFailure) {
      if (Date.now() - this.lastFailureTime > this.retry) {
        this.state = "HALF-OPEN";
      } else {
        this.state = "OPEN";
      }
    } else {
      this.reset();
    }
  }

  private checkCircuit() {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();

    if (this.state === "HALF-OPEN") {
      this.state = "OPEN";
    }
  }

  private reset() {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastFailureTime = null;
  }
}
