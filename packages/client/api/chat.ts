import type { VercelRequest, VercelResponse } from "@vercel/node";
import Pusher from "pusher";
import { isPlayer, entityToAddress } from "../src/util/common";
import { recoverMessageAddress } from "viem";

export const pusher = new Pusher({
  appId: process.env.PRI_PUSHER_APP_ID!,
  key: process.env.PRI_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  host: process.env.PRI_PUSHER_APP_HOST!,
  port: process.env.PRI_PUSHER_APP_PORT!,
  useTLS: true,
});

export default async function handleChatRequest(req: VercelRequest, res: VercelResponse) {
  const { user, message, signature, uuid, channel } = req.body;

  if (!isPlayer(user)) return res.status(400).send("Invalid user");

  const signer = await recoverMessageAddress({
    message,
    signature,
  });

  if (signer !== entityToAddress(user)) return res.status(401).send("Invalid signature");

  if (message.length === 0) return res.status(200).send("OK");

  try {
    await pusher.trigger(channel, "message", {
      user: user ?? "unknown",
      message: message.trim(128),
      time: Date.now(),
      uuid: uuid,
    });

    // store message in kv by channel
  } catch (e) {
    console.log(e);
  }

  res.status(200).send("OK");
}
