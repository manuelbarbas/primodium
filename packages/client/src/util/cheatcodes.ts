import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Cheatcodes } from "@primodiumxyz/mud-game-tools";
import { SetupResult } from "src/network/types";
import { BlockType } from "./constants";
const resources: Record<string, Entity> = {
  iron: BlockType.Iron,
  copper: BlockType.Copper,
  lithium: BlockType.Lithium,
  water: BlockType.Water,
  titanium: BlockType.Titanium,
  iridium: BlockType.Iridium,
  sulfur: BlockType.Sulfur,
  osmium: BlockType.Osmium,
  tungsten: BlockType.Tungsten,
  kimberlite: BlockType.Kimberlite,
  uraninite: BlockType.Uraninite,
  bolutite: BlockType.Bolutite,
  ironplate: BlockType.IronPlate,
  platinum: BlockType.Platinum,
  alloy: BlockType.Alloy,
  pvcell: BlockType.PVCell,
  housing: BlockType.U_Housing,
  // vessel: BlockType.VesselCapacity,
  electricity: BlockType.U_Electricity,
};

const units: Record<string, Entity> = {
  stinger: BlockType.StingerDrone,
  aegis: BlockType.AegisDrone,
  anvillight: BlockType.AnvilLightDrone,
  hammerlight: BlockType.HammerLightDrone,
  mining: BlockType.MiningVessel,
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
