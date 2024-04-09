import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";

export type ObjectiveType = "Build" | "Upgrade" | "Train" | "Expand" | "Claimable" | "JoinAlliance";

// Define a base type for common properties
export type BaseObjective = {
  category: string;
  description?: string;
  requiredMainBase?: bigint;
  requiredObjectives?: EObjectives[];
};

export type BuildObjective = BaseObjective & {
  type: "Build";
  buildingType: Entity;
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

// Union of all Objective types
export type Objective =
  | BuildObjective
  | UpgradeObjective
  | TrainUnitObjective
  | ExpandObjective
  | ClaimableObjective
  | JoinAllianceObjective;

export type ObjectiveReq = {
  tooltipText?: string;
  backgroundImage?: string;
  requiredValue: bigint;
  currentValue: bigint;
  isBool?: boolean;
  scale: bigint;
};
