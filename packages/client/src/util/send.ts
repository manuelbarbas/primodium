import { UnitCountTuple } from "./web3/types";

export function toUnitCountArray(rawArr: bigint[]): UnitCountTuple {
  const arr = [...rawArr, 0n, 0n, 0n, 0n, 0n, 0n, 0n].slice(0, 7);
  return [arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6]];
}
