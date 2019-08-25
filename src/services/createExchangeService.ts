import * as amqplib from "amqplib";

export default class CreateExchange {
  private excName: string;
  private type: string;

  constructor(excName, type) {
    this.excName = excName;
    this.type = type;
  }

  public async createConnection() {
    const url = process.env.AMQP_LOCAL || process.env.AMQP_URL;
    try {
      const conn = await amqplib.connect(url);
      const channel = await conn.createChannel();
      return channel.assertExchange(this.excName, this.type, {
        autoDelete: false,
        durable: true,
      });
    } catch (err) {
      throw new Error("error occurred while connecting to amqp - " + err);
    }
  }
}
