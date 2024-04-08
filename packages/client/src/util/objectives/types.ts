import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";

export type ObjectiveType = "Build";
export type Objective = {
  type: ObjectiveType;
  description?: string;
  requiredMainBase?: bigint;
  requiredObjectives?: EObjectives[];
} & BuildObjective;

export type BuildObjective = {
  buildingType: Entity;
  level: bigint;
};

export type ObjectiveReq = {
  requiredValue: bigint;
  currentValue: bigint;
  scale: bigint;
  type: ObjectiveReqType;
};

export type ObjectiveReqType = "Building" | "Resource" | "RewardResources" | "RewardUtilities";
