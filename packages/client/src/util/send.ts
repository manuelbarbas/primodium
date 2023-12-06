import { Entity } from "@latticexyz/recs";
import { UnitEnumLookup } from "./constants";
import { UnitCountTuple } from "./web3/types";

export function toUnitCountArray(map: Record<Entity, bigint>): UnitCountTuple {
  const arr: UnitCountTuple = [0n, 0n, 0n, 0n, 0n, 0n, 0n];
  Object.entries(map).forEach(([key, value]) => {
    console.log(key);
    const index = UnitEnumLookup[key as Entity];
    if (index === undefined) throw new Error("Invalid unit entity");
    arr[index - 1] = value;
  });
  return arr;
}
