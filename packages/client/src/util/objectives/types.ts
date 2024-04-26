import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";

export type ObjectiveType =
  | "Build"
  | "BuildAny"
  | "Upgrade"
  | "Train"
  | "Expand"
  | "Claimable"
  | "JoinAlliance"
  | "Asteroid"
  | "Resource";

// Define a base type for common properties
export type BaseObjective = {
  category: ObjectiveCategory;
  description?: string;
  requiredMainBase?: bigint;
  requiredObjectives?: EObjectives[];
};

export type BuildObjective = BaseObjective & {
  type: "Build";
  buildingType: Entity;
};

export type BuildAnyObjective = BaseObjective & {
  type: "BuildAny";
  buildingTypes: Entity[];
};

export type UpgradeObjective = BaseObjective & {
  type: "Upgrade";
  buildingType: Entity;
  level: bigint;
};

export type TrainUnitObjective = BaseObjective & {
  type: "Train";
  unitType: Entity;
  unitCount: bigint;
};

export type ExpandObjective = BaseObjective & {
  type: "Expand";
  level: bigint;
};

export type ClaimableObjective = BaseObjective & {
  type: "Claim";
  icon: string;
  tooltip: string;
};

export type JoinAllianceObjective = BaseObjective & {
  type: "JoinAlliance";
};

export type AsteroidObjective = BaseObjective & {
  asteroidType: "wormhole" | "shard" | "motherlode" | "basic";
  type: "Asteroid";
};

export type ResourceObjective = BaseObjective & {
  type: "Resource";
  resources: Record<Entity, bigint>;
  anyOrEvery: "any" | "every";
};

// Union of all Objective types
export type Objective =
  | BuildObjective
  | BuildAnyObjective
  | UpgradeObjective
  | TrainUnitObjective
  | ExpandObjective
  | ClaimableObjective
  | JoinAllianceObjective
  | AsteroidObjective
  | ResourceObjective;

export type ObjectiveReq = {
  tooltipText?: string;
  backgroundImage?: string;
  requiredValue: bigint;
  currentValue: bigint;
  isBool?: boolean;
  scale: bigint;
};

export const objectiveCategories = [
  "Fundamentals",
  "Conquest",
  "Fleet",
  "Combat",
  "Motherlode",
  "Victory (Shard)",
  "Victory (Wormhole)",
  "Unit Management",
  "Unit Storage",
  "Unit Production",
  "Defense",
  "Resource Production",
  "Market",
  "Alliance",
] as const;
export type ObjectiveCategory = (typeof objectiveCategories)[number];
