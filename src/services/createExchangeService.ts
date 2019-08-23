import * as amqplib from "amqplib";

export default class CreateExchange {
  private excName: string;

  constructor(excName) {
    this.excName = excName;
  }

  public async createConnection() {
    const url = process.env.AMQP_LOCAL || process.env.AMQP_URL;
    try {
      const conn = await amqplib.connect(url);
      console.log("conn - ", conn);
      const channel = await conn.createChannel();
      return channel.assertExchange(this.excName, "direct", {
        autoDelete: false,
        durable: true,
      });
    } catch (err) {
      throw new Error("error occurred while connecting to amqp - " + err);
    }
  }
}