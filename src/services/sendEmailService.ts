import ToggleQueue from "../ApprochOne/toggleQueue";
import CircuitBreaker from "../ApprochTwo/circuitBreaker";
import MailGun from "./../thirdPartyVendor/providerMailGun";
import SendGrid from "./../thirdPartyVendor/providerSendGrid";
import CreateExchange from "./createExchangeService";

const formatEmailAddress = (data) => {
  if (data) {
    return data
      .split(",")
      .map((email) => email.trim())
      .join(",");
  }
};

export default class EmailService {
  private sendGrid: CircuitBreaker | ToggleQueue;
  private mailGun: CircuitBreaker | ToggleQueue;

  public async buildQueues() {
    if (process.env.APPROACH === "ApprochOne") {
      // Toogle queues on single failure approch
      const emailEx = new CreateExchange("emailEx");
      await emailEx.createConnection();

      this.mailGun = new ToggleQueue("emailEx", new MailGun(), "mailgun-2");
      this.sendGrid = new ToggleQueue("emailEx", new SendGrid(), "sendgrid-2");

      await this.mailGun.createConnection();
      await this.sendGrid.createConnection();

      return;
    } else if (process.env.APPROACH === "ApprochTwo") {
      // Circuit Breker approch
      const dlx = new CreateExchange("DLX");
      await dlx.createConnection();

      this.mailGun = new CircuitBreaker(
        "DLX",
        new MailGun(),
        "q.mailgun",
        6000,
        1
      );
      this.sendGrid = new CircuitBreaker(
        "DLX",
        new SendGrid(),
        "q.sendgrid",
        6000,
        1
      );

      await this.mailGun.createConnection();
      await this.sendGrid.createConnection();
      return;
    }
  }

  public async send(input) {
    // Normalise data for each mail provider
    const data = {
      bcc: formatEmailAddress(input.bcc),
      cc: formatEmailAddress(input.cc),
      from: "sandippagi@gmail.com",
      subject: input.subject,
      text: input.body,
      to: formatEmailAddress(input.to)
    };

    try {
      this.mailGun.sendToQueue(data);
      return;
    } catch (error) {
      console.error(error);
    }

    try {
      this.sendGrid.sendToQueue(data);
      return;
    } catch (error) {
      console.error(error);
    }
    throw new Error("No email providers closed");
  }
}
