import * as amqplib from 'amqplib';

export default class DLExchange {
  excName: string;

  constructor(excName) {
    this.excName = excName;
  }

  async createConnection() {
    const url = process.env.AMQP_URL;
    const conn = await amqplib.connect(url);
    const channel = await conn.createChannel();

    return channel.assertExchange(this.excName, 'direct', {durable: true, autoDelete: false});
  }
}
