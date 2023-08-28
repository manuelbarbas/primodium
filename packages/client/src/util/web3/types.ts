import { EntityID } from "@latticexyz/recs";

export enum ESpaceRockType {
  None,
  Asteroid,
  Motherlode,
}

export enum EMotherlodeSize {
  SMALL,
  MEDIUM,
  LARGE,
}

export enum EMotherlodeType {
  TITANIUM,
  IRIDIUM,
  PLATINUM,
  KIMBERLITE,
}

export enum ESendType {
  INVADE,
  RAID,
  REINFORCE,
}

export type ArrivalUnit = {
  unitType: EntityID;
  count: number;
};
