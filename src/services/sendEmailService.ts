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
    const emailEx = new CreateExchange("emailEx", "direct");
    await emailEx.createConnection();

    if (process.env.APPROACH === "ApprochOne") {
      // Toogle queues on single failure approch
      this.mailGun = new ToggleQueue("emailEx", new MailGun(), "mailgun-1");
      this.sendGrid = new ToggleQueue("emailEx", new SendGrid(), "sendgrid-1");
    } else if (process.env.APPROACH === "ApprochTwo") {
      // Circuit Breker approch
      this.mailGun = new CircuitBreaker(
        "emailEx",
        new MailGun(),
        "mailgun-2",
        6000, 1,
      );
      this.sendGrid = new CircuitBreaker(
        "emailEx",
        new SendGrid(),
        "sendgrid-2",
        6000, 1,
      );
    }

    await this.mailGun.createConnection();
    await this.sendGrid.createConnection();
    return;
  }

  public async send(input) {
    const data = {
      bcc: formatEmailAddress(input.bcc),
      cc: formatEmailAddress(input.cc),
      from: "sandippagi@gmail.com",
      subject: input.subject,
      text: input.body,
      to: formatEmailAddress(input.to),
    };

    try {
      // console.log("Sending mail from MG");
      await this.mailGun.sendToQueue(data);
      return;
    } catch (error) {
      // console.error("Circuit broken for MG", error);
    }

    try {
      // console.log("Sending mail from SG");
      await this.sendGrid.sendToQueue(data);
      return;
    } catch (error) {
      // console.error("Circuit broken for SG", error);
    }

    throw new Error("Both email provider are alive");
  }
}
