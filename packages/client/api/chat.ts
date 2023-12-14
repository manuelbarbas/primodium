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

type PadOptions = {
  dir?: "left" | "right";
  size?: number | null;
};

export type PadReturnType<TValue extends ByteArray | Hex> = TValue extends Hex ? Hex : ByteArray;

export function pad<TValue extends ByteArray | Hex>(
  hexOrBytes: TValue,
  { dir, size = 32 }: PadOptions = {}
): PadReturnType<TValue> {
  if (typeof hexOrBytes === "string") return padHex(hexOrBytes, { dir, size }) as PadReturnType<TValue>;
  return padBytes(hexOrBytes, { dir, size }) as PadReturnType<TValue>;
}

export function padHex(hex_: Hex, { dir, size = 32 }: PadOptions = {}) {
  if (size === null) return hex_;
  const hex = hex_.replace("0x", "");
  if (hex.length > size * 2)
    throw new Error(
      JSON.stringify({
        size: Math.ceil(hex.length / 2),
        targetSize: size,
        type: "hex",
      })
    );

  return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size * 2, "0")}` as Hex;
}

export function padBytes(bytes: ByteArray, { dir, size = 32 }: PadOptions = {}) {
  if (size === null) return bytes;
  if (bytes.length > size)
    throw new Error(
      JSON.stringify({
        size: bytes.length,
        targetSize: size,
        type: "bytes",
      })
    );
  const paddedBytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    const padEnd = dir === "right";
    paddedBytes[padEnd ? i : size - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
  }
  return paddedBytes;
}

export function isHex(value: unknown, { strict = true }: { strict?: boolean } = {}): value is Hex {
  if (!value) return false;
  if (typeof value !== "string") return false;
  return strict ? /^0x[0-9a-fA-F]*$/.test(value) : value.startsWith("0x");
}

export function size(value: Hex | ByteArray) {
  if (isHex(value, { strict: false })) return Math.ceil((value.length - 2) / 2);
  return value.length;
}

// The following three functions match their respective implementations in packages/client/src/util/common.ts
// except implemented with ethers.js instead of viem due to issue #686
export const normalizeAddress = (address: Hex): Hex => {
  return pad(trim(address), { size: 20 });
};

export const entityToAddress = (entity: Entity | string, shorten = false): Hex => {
  const normalizedAddress = normalizeAddress(entity as Hex);
  const checksumAddress = ethers.utils.getAddress(normalizedAddress);
  return shorten ? shortenAddress(checksumAddress as Hex) : (checksumAddress as Hex);
};

export const isPlayer = (entity: Entity) => {
  const addressSize = size(trim(entity as Hex));
  return addressSize <= 20;
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
  const ip = (req.headers["x-forwarded-for"] ?? ["127.0.0.1"])[0];
  console.log(ip);
  const { user, message, signature, uuid, channel } = req.body;

  const rateLimitKey = `rateLimit:${ip}`;

  const isRateLimited = await kv.get(rateLimitKey);
  if (isRateLimited) {
    return res.status(429).send("Rate limit exceeded. Please wait a second.");
  }

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
    // Set a rate limit key with 1-second expiration
    await kv.set(rateLimitKey, "1", { ex: 1 });

    // store message in kv by channel
  } catch (e) {
    console.log(e);
  }

  res.status(200).send("OK");
}
