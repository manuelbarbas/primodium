import { EntityType } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";

type TesterPackFleet = {
  units: Map<Entity, number>;
  resources: Map<Entity, number>;
};

export type TesterPack = {
  worldSpeed?: number;
  players?: number;
  buildings?: Entity[];
  fleets?: TesterPackFleet[];
  expansion?: number;
  mainBaseLevel?: number;
  resources?: Map<Entity, number>;
  storages?: Map<Entity, number>;
  units?: Map<Entity, number>;
};

export const testerPacks: Record<string, TesterPack> = {
  shipyardPack: {
    mainBaseLevel: 2,
    expansion: 4,
    buildings: [EntityType.Shipyard, EntityType.DroneFactory, EntityType.Workshop],
    fleets: [
      {
        units: new Map([[EntityType.AnvilDrone, 10]]),
        resources: new Map([[EntityType.Iron, 100]]),
      },
    ],
    resources: new Map([
      [EntityType.Copper, 1000000],
      [EntityType.Alloy, 1000000],
      [EntityType.Lithium, 1000000],
    ]),
  },
  asteroidExplosionPack: {
    worldSpeed: 50000,
    players: 25,
    fleets: [
      {
        units: new Map([[EntityType.ColonyShip, 10]]),
        resources: new Map([]),
      },
    ],
    storages: new Map([[EntityType.ColonyShipCapacity, 100000]]),
  },
  marketPack: {
    buildings: [EntityType.Market],
    resources: new Map([
      [EntityType.Copper, 1000000],
      [EntityType.Alloy, 1000000],
      [EntityType.Lithium, 1000000],
      [EntityType.Kimberlite, 1000000],
    ]),
  },
};
