import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";

type Chat = {
  channel: string;
  message: string;
  timestamp: number;
  user: string;
};

export default async function handleChatHistory(req: VercelRequest, res: VercelResponse) {
  const { channel } = req.query;

  try {
    if (!channel) return res.status(400).send("Bad Request");

    const pipeline = kv.pipeline();
    const chats: string[] = await kv.zrange(`chat:${channel}`, -99, -1);

    for (const chat of chats) {
      pipeline.hgetall(chat);
    }

    const results = (await pipeline.exec()).filter(Boolean) as Chat[];

    console.log(results.length);

    //remove null

    return res.send(results);

    // store message in kv by channel
  } catch (e) {
    console.log(e);
    return res.status(200).send([]);
  }
}
