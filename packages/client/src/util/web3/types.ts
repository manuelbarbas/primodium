import { Entity } from "@latticexyz/recs";

export type UnitCountTuple = [bigint, bigint, bigint, bigint, bigint, bigint, bigint];
export type ArrivalUnit = {
  unitType: Entity;
  count: number;
};
