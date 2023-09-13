import { stringToHex } from "viem";

export default function encodeBytes32(value: string | number): `0x${string}` {
  if (typeof value === "number") {
    return `0x${value}`;
  }
  return stringToHex(value.substring(0, 32), { size: 32 });
}
