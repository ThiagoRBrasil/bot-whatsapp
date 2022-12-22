import parsePhoneNumber, { isValidPhoneNumber } from "libphonenumber-js";
import { create, Whatsapp, SocketState } from "venom-bot";

export type QRCode = {
  base64Qr: string;
  asciiQR: string;
  attempts: number;
  urlCode?: string;
};

export default class Sender {
  private session: string;
  private client: Whatsapp;
  private connected: boolean;
  private qr: QRCode;

  get isConnected(): boolean {
    return this.connected;
  }

  get qrCode(): QRCode {
    return this.qr;
  }

  constructor(session?: string) {
    this.session = session || "session-name";
    this.initialize();
  }

  async sendText(to: string, body: string) {
    if (!isValidPhoneNumber(to)) {
      throw new Error("This number is not valid");
    }

    let phoneNumber = parsePhoneNumber(to, "BR")
      ?.format("E.164")
      ?.replace("+", "") as string;

    phoneNumber = phoneNumber.includes("@c.us")
      ? phoneNumber
      : `${phoneNumber}@c.us`;

    await this.client.sendText(phoneNumber, body);
  }

  private initialize() {
    const qr = (
      base64Qr: string,
      asciiQR: string,
      attempts: number,
      urlCode?: string
    ) => {
      this.qr = { base64Qr, asciiQR, attempts, urlCode };
    };

    const start = (client: Whatsapp) => {
      this.client = client;

      client.onStateChange((state) => {
        this.connected = state === SocketState.CONNECTED;
      });
    };

    create({
      session: this.session,
      catchQR: qr,
      puppeteerOptions: {
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
        ],
      },
    })
      .then((client) => start(client))
      .catch((erro) => {
        console.log(erro);
      });
  }
}
