import * as amqplib from 'amqplib';

export default class EmailQueues {
    qname: string;
    vendor: any;
    DLExchange: string;
    threshHoldFailure: number;
    retry: number;
    dLQueue: string;
    channel: any;
    state: string;
    failureCount: number;
    lastFailureTime: any;


  constructor(DLExchange, vendor, qname, retry, threshHoldFailure) {
      this.DLExchange = DLExchange;
      this.vendor = vendor;
      this.qname = qname;
      this.retry = retry;
      this.threshHoldFailure = threshHoldFailure;
      this.dLQueue = `${DLExchange}.${qname}`;
      this.channel = null;
      this.reset();
  }

  async createConnection() {
    const url = process.env.AMQP_URL;
    const conn = await amqplib.connect(url);

    this.channel = await conn.createChannel();

    await this.producer();
    await this.consumers();
  }

  async producer() {
    await this.channel.assertQueue(this.dLQueue, {durable: true});
    await this.channel.bindQueue(this.dLQueue, this.DLExchange, this.qname);

    await this.channel.assertQueue(this.qname, {
      deadLetterExchange: this.DLExchange,
      deadLetterRoutingKey: this.qname,
      durable: true,
    });
  }

  async consumers() {
    await this.channel.consume(this.qname, async (msg) => {
      if (msg !== null) {
        try {
          const emailData = JSON.parse(msg.content.toString('utf8'));
          await this.vendor.sendEmail(emailData);
          this.channel.ack(msg);
          console.info('Email sent', emailData);
        }
        catch (err) {
          console.error('Email failed', this.qname, err);
          this.checkCircuit();
          this.channel.reject(msg, {requeue: false});
        }
      }
    });

    await this.channel.consume(this.dLQueue, async (msg) => {
      if (msg !== null) {
        try {
          console.info('Processing', this.qname);
          this.checkCircuit();
        } catch (err) {
          await this.channel.reject(msg);
        }
      }
    });
  }

  updateState() {
    // Set the current state of our circuit breaker
    if (this.failureCount > this.threshHoldFailure) {
      if ((Date.now() - this.lastFailureTime) > this.retry) {
        this.state = 'HALF-OPEN';
      } else {
        this.state = 'OPEN';
      }
    } else {
      this.reset();
    }
  }

  checkCircuit() {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF-OPEN') {
      this.state = 'OPEN';
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  async sendToQueue(email) {
    this.updateState();
    if (this.state === 'OPEN') {
      throw new Error('Circuit open');
    }
    return this.channel.sendToQueue(this.qname, Buffer.from(JSON.stringify(email)));
  }
}