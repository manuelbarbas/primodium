import { Entity } from "@latticexyz/recs";

type TesterPackBuilding = {
  prototype: Entity;
  level: number;
};

type TesterPackFleet = {
  units: Map<Entity, number>;
  resources: Map<Entity, number>;
};

export type TesterPack = {
  buildings: TesterPackBuilding[];
  fleets: TesterPackFleet[];
  expansion: number;
  mainBaseLevel: number;
  resources: Map<Entity, number>;
  units: Map<Entity, number>;
};

export const testerPacks: Record<string, TesterPack> = {
  beginner: {
    buildings: [],
    fleets: [],
    expansion: 2,
    mainBaseLevel: 3,
    resources: new Map(),
    units: new Map(),
  },
};
