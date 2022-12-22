import { Router, Request, Response } from "express";
import Sender from "../models/Sender";

const routes = Router();

const sender = new Sender();

routes.get("/status", (req: Request, res: Response) => {
  return res.json({
    qr_code: sender.qrCode,
    connected: sender.isConnected,
  });
});

routes.post("/send", async (req: Request, res: Response) => {
  try {
    const { number, message } = req.body;
    await sender.sendText(number, message);
    return res.status(200).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: error });
  }
});

export default routes;
