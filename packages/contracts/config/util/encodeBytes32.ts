import { stringToHex } from "viem";

function encode(value: string | number, length: number): `0x${string}` {
  if (typeof value === "number") {
    return `0x${value}`;
  }
  return stringToHex(value.substring(0, length), { size: length });
}

export default function encodeBytes32(value: string | number): `0x${string}` {
  return encode(value, 32);
}
