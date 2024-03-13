import { Entity } from "@latticexyz/recs";
import { EntityType } from "../constants";

type TesterPackFleet = {
  units: Map<Entity, number>;
  resources: Map<Entity, number>;
};

export type TesterPack = {
  buildings?: Entity[];
  fleets?: TesterPackFleet[];
  expansion?: number;
  mainBaseLevel?: number;
  resources?: Map<Entity, number>;
  units?: Map<Entity, number>;
};

export const testerPacks: Record<string, TesterPack> = {
  starterPack: {
    expansion: 2,
    buildings: [
      EntityType.Garage,
      EntityType.IronMine,
      EntityType.IronMine,
      EntityType.CopperMine,
      EntityType.CopperMine,
      EntityType.PVCellFactory,
      EntityType.AlloyFactory,
      EntityType.Market,
      EntityType.Shipyard,
      EntityType.StarmapperStation,
      EntityType.DroneFactory,
      EntityType.Garage,
      EntityType.SolarPanel,
    ],
    fleets: [
      {
        units: new Map([[EntityType.AnvilDrone, 10]]),
        resources: new Map([[EntityType.Iron, 100]]),
      },
    ],
    resources: new Map([[EntityType.Iron, 100]]),
    units: new Map([[EntityType.AnvilDrone, 69]]),
  },
};
