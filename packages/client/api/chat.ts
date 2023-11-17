import type { VercelRequest, VercelResponse } from "@vercel/node";
import Pusher from "pusher";

export const pusher = new Pusher({
  appId: process.env.PRI_PUSHER_APP_ID!,
  key: process.env.PRI_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  host: process.env.PRI_PUSHER_APP_HOST!,
  port: process.env.PRI_PUSHER_APP_PORT!,
  useTLS: true,
});

export default async function handleChatRequest(req: VercelRequest, res: VercelResponse) {
  const { user, message, uuid } = req.body;

  if (message.length === 0) res.status(200).send("OK");

  try {
    await pusher.trigger("chat", "message", {
      user: user ?? "unknown",
      message: message.trim(128),
      time: Date.now(),
      uuid: uuid,
    });
  } catch (e) {
    console.log(e);
  }

  res.status(200).send("OK");
}
