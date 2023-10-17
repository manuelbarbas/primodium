import { Entity } from "@latticexyz/recs";
import { encodeEntity, singletonEntity } from "@latticexyz/store-sync/recs";
import { Cheatcodes } from "@primodiumxyz/mud-game-tools";
import { SetupResult } from "src/network/types";
import { EntityType, ResourceEnumLookup, ResourceStorages, UtilityStorages, toHex32 } from "./constants";
import { hashKeyEntity } from "./encode";
import { Hex } from "viem";
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
  housing: EntityType.Housing,
  // vessel: BlockType.VesselCapacity,
  electricity: EntityType.Electricity,
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
    getResource: {
      params: [{ name: "resource", type: "string" }],
      function: async (resource: string) => {
        const player = mud.network.playerEntity;
        if (!player) throw new Error("No player found");

        const resourceEntity = resources[resource.toLowerCase()];

        if (!resourceEntity) throw new Error("Resource not found");

        await mud.contractCalls.setComponentValue(
          mud.components.ResourceCount,
          encodeEntity(
            { entity: "bytes32", resource: "uint8" },
            { entity: player as Hex, resource: ResourceEnumLookup[resourceEntity] }
          ),
          {
            value: 10000000n,
          }
        );
      },
    },
    getMaxResource: {
      params: [{ name: "resource", type: "string" }],
      function: async (resource: string) => {
        const player = mud.network.playerEntity;
        if (!player) throw new Error("No player found");

        const resourceEntity = resources[resource.toLowerCase()];

        if (!resourceEntity) throw new Error("Resource not found");

        await mud.contractCalls.setComponentValue(
          mud.components.MaxResourceCount,
          encodeEntity(
            { entity: "bytes32", resource: "uint8" },
            { entity: player as Hex, resource: ResourceEnumLookup[resourceEntity] }
          ),
          {
            value: 10000000n,
          }
        );
      },
    },
    getTesterPack: {
      params: [],
      function: async () => {
        const player = mud.network.playerEntity;

        ResourceStorages.forEach(async (resource) => {
          if (!player) throw new Error("No player found");

          await mud.contractCalls.setComponentValue(
            mud.components.ResourceCount,
            encodeEntity(
              { entity: "bytes32", resource: "uint8" },
              { entity: player as Hex, resource: ResourceEnumLookup[resource] }
            ),
            {
              value: 10000000n,
            }
          );
        });

        UtilityStorages.forEach(async (resource) => {
          if (!player) throw new Error("No player found");

          await mud.contractCalls.setComponentValue(
            mud.components.MaxResourceCount,
            encodeEntity(
              { entity: "bytes32", resource: "uint8" },
              { entity: player as Hex, resource: ResourceEnumLookup[resource] }
            ),
            {
              value: 10000000n,
            }
          );
        });

        UtilityStorages.forEach(async (resource) => {
          if (!player) throw new Error("No player found");

          await mud.contractCalls.setComponentValue(
            mud.components.ResourceCount,
            encodeEntity(
              { entity: "bytes32", resource: "uint8" },
              { entity: player as Hex, resource: ResourceEnumLookup[resource] }
            ),
            {
              value: 10000000n,
            }
          );
        });
      },
    },
  };
};
