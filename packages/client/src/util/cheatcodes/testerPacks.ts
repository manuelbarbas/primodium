import { Entity } from "@latticexyz/recs";
import { EntityType } from "../constants";

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
  starterPack: {
    mainBaseLevel: 2,
    expansion: 4,
    buildings: [
      EntityType.Garage,
      EntityType.IronMine,
      EntityType.IronMine,
      EntityType.CopperMine,
      EntityType.CopperMine,
      EntityType.AlloyFactory,
      EntityType.Market,
      EntityType.Shipyard,
      EntityType.StarmapperStation,
      EntityType.DroneFactory,
      EntityType.Garage,
      EntityType.SolarPanel,
      EntityType.Hangar,
      EntityType.PVCellFactory,
    ],
    fleets: [
      {
        units: new Map([[EntityType.AnvilDrone, 10]]),
        resources: new Map([[EntityType.Iron, 100]]),
      },
    ],
    resources: new Map([
      [EntityType.Kimberlite, 10000],
      [EntityType.Platinum, 10000],
      [EntityType.Iridium, 10000],
      [EntityType.Titanium, 10000],
    ]),
    units: new Map([
      [EntityType.AnvilDrone, 69],
      [EntityType.MinutemanMarine, 69000],
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
};
