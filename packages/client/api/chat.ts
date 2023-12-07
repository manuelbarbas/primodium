import { ethers } from "ethers";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";
import Pusher from "pusher";
import { Entity } from "@latticexyz/recs";

//TODO: TEMP. CANNOT RESOLVE MODULE FOR LOCAL FILES SOME REASON. VIEM TS ISSUES AS WELL
export type ByteArray = Uint8Array;
export type Hex = `0x${string}`;
export type ErrorType<name extends string = "Error"> = Error & { name: name };

type TrimOptions = {
  dir?: "left" | "right";
};
export type TrimReturnType<TValue extends ByteArray | Hex> = TValue extends Hex ? Hex : ByteArray;

export type TrimErrorType = ErrorType;

export function trim<TValue extends ByteArray | Hex>(
  hexOrBytes: TValue,
  { dir = "left" }: TrimOptions = {}
): TrimReturnType<TValue> {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  let data: any = typeof hexOrBytes === "string" ? hexOrBytes.replace("0x", "") : hexOrBytes;

  let sliceLength = 0;
  for (let i = 0; i < data.length - 1; i++) {
    if (data[dir === "left" ? i : data.length - i - 1].toString() === "0") sliceLength++;
    else break;
  }
  data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);

  if (typeof hexOrBytes === "string") {
    if (data.length === 1 && dir === "right") data = `${data}0`;
    return `0x${data.length % 2 === 1 ? `0${data}` : data}` as TrimReturnType<TValue>;
  }
  return data as TrimReturnType<TValue>;
}

export const entityToAddress = (entity: Entity | string, shorten = false): Hex => {
  const trimmedAddress = trim(entity as Hex);

  const checksumAddress = ethers.utils.isAddress(trimmedAddress)
    ? ethers.utils.getAddress(trimmedAddress)
    : trimmedAddress;

  return shorten ? shortenAddress(checksumAddress as Hex) : (checksumAddress as Hex);
};

export const isPlayer = (entity: Entity) => {
  const trimmedAddress = trim(entity as Hex);

  return ethers.utils.isAddress(trimmedAddress);
};

export const shortenAddress = (address: Hex): Hex => {
  return `0x${address.slice(2, 6)}...${address.slice(-4)}`;
};

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
  console.log(uuid);

  if (!isPlayer(user)) return res.status(400).send("Invalid user");

  if (entityToAddress(user) !== ethers.utils.verifyMessage(message, signature)) {
    return res.status(401).send("Invalid signature");
  }

  if (message.length === 0) return res.status(200).send("OK");

  try {
    const payload = {
      user: user ?? "unknown",
      message: message.trim(128),
      time: Date.now(),
      uuid: uuid,
    };

    await pusher.trigger(channel, "message", payload);

    //store chat history in kv
    await kv.hmset(`chat:${channel}:${payload.uuid}`, payload);
    await kv.zadd(`chat:${channel}`, { score: payload.time, member: `chat:${channel}:${payload.uuid}` });
    await kv.expire(`chat:${channel}:${payload.uuid}`, 60 * 60 * 12); // 12 hours

    // store message in kv by channel
  } catch (e) {
    console.log(e);
  }

  res.status(200).send("OK");
}
