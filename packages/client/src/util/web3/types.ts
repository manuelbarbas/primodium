import { Entity } from "@latticexyz/recs";

export enum ERock {
  None,
  Asteroid,
  Motherlode,
}

export enum ESize {
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

export const ESendTypeToLiteral: Record<ESendType, "INVADE" | "RAID" | "REINFORCE"> = {
  [ESendType.INVADE]: "INVADE",
  [ESendType.RAID]: "RAID",
  [ESendType.REINFORCE]: "REINFORCE",
};

export type ArrivalUnit = {
  unitType: Entity;
  count: number;
};
