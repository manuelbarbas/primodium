import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Cheatcodes } from "@primodiumxyz/mud-game-tools";
import { SetupResult } from "src/network/types";
import { EntityType } from "./constants";
const resources: Record<string, Entity> = {
  iron: EntityType.Iron,
  copper: EntityType.Copper,
  lithium: EntityType.Lithium,
  water: EntityType.Water,
  titanium: EntityType.Titanium,
  iridium: EntityType.Iridium,
  sulfur: EntityType.Sulfur,
  osmium: EntityType.Osmium,
  tungsten: EntityType.Tungsten,
  kimberlite: EntityType.Kimberlite,
  uraninite: EntityType.Uraninite,
  bolutite: EntityType.Bolutite,
  ironplate: EntityType.IronPlate,
  platinum: EntityType.Platinum,
  alloy: EntityType.Alloy,
  pvcell: EntityType.PVCell,
  housing: EntityType.U_Housing,
  // vessel: BlockType.VesselCapacity,
  electricity: EntityType.U_Electricity,
};

const units: Record<string, Entity> = {
  stinger: EntityType.StingerDrone,
  aegis: EntityType.AegisDrone,
  anvillight: EntityType.AnvilLightDrone,
  hammerlight: EntityType.HammerLightDrone,
  mining: EntityType.MiningVessel,
};

export const setupCheatcodes = (mud: SetupResult): Cheatcodes => {
  return {
    setCounter: {
      params: [{ name: "value", type: "number" }],
      function: async (value: number) => {
        console.log("value:", value);
        mud.contractCalls.setComponentValue(mud.components.Counter, singletonEntity, { value: BigInt(value) });
      },
    },
    removeCounter: {
      params: [],
      function: async () => {
        mud.contractCalls.removeComponent(mud.components.Counter, singletonEntity);
      },
    },
  };
};
