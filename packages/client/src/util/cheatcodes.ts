import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Cheatcodes } from "@primodiumxyz/mud-game-tools";
import { components } from "src/network/components";
import { SetupResult } from "src/network/types";
import { encodeEntity } from "src/util/encode";
import { Hex, padHex, trim } from "viem";
import { EntityType, ResourceEnumLookup, ResourceStorages, UtilityStorages } from "./constants";
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
  vessel: EntityType.VesselCapacity,
  electricity: EntityType.Electricity,
  defense: EntityType.Defense,
  orders: EntityType.MaxOrders,
};

const units: Record<string, Entity> = {
  stinger: EntityType.StingerDrone,
  aegis: EntityType.AegisDrone,
  anvil: EntityType.AnvilDrone,
  hammer: EntityType.HammerDrone,
  mining: EntityType.MiningVessel,
};

export const setupCheatcodes = (mud: SetupResult): Cheatcodes => {
  return {
    setWorldSpeed: {
      params: [{ name: "value", type: "number" }],
      function: async (value: number) => {
        await mud.contractCalls.setComponentValue(mud.components.P_GameConfig, singletonEntity, {
          worldSpeed: BigInt(value),
        });
      },
    },
    setSpecate: {
      params: [{ name: "value", type: "string" }],
      function: async (value: string) => {
        console.log(value);
        if (!value) {
          components.SpectateAccount.set({ value: mud.network.playerEntity });
          return;
        }
        components.SpectateAccount.set({
          value: padHex(value as Hex, {
            size: 32,
          }).toLowerCase() as Entity,
        });
      },
    },
    setMaxAllianceCount: {
      params: [{ name: "value", type: "number" }],
      function: async (value: number) => {
        await mud.contractCalls.setComponentValue(mud.components.P_AllianceConfig, singletonEntity, {
          maxAllianceMembers: BigInt(value),
        });
      },
    },
    maxMainBaseLevel: {
      params: [],
      function: async () => {
        const mainBase = mud.components.Home.get(mud.network.playerEntity)?.mainBase as Entity | undefined;
        if (!mainBase) throw new Error("No main base found");
        const maxLevel = mud.components.P_MaxLevel.get(mainBase)?.value ?? 8n;
        await mud.contractCalls.setComponentValue(mud.components.Level, mainBase, {
          value: maxLevel,
        });
      },
    },
    getResource: {
      params: [{ name: "resource", type: "string" }],
      function: async (resource: string) => {
        const player = mud.network.playerEntity;
        if (!player) throw new Error("No player found");
        const homeAsteroid = mud.components.Home.get(player)?.asteroid as Entity | undefined;

        const resourceEntity = resources[resource.toLowerCase()];

        if (!resourceEntity || !homeAsteroid) throw new Error("Resource not found");

        console.log("getting", resource);
        await mud.contractCalls.setComponentValue(
          mud.components.ResourceCount,
          encodeEntity(
            { entity: "bytes32", resource: "uint8" },
            { entity: homeAsteroid as Hex, resource: ResourceEnumLookup[resourceEntity] }
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
            value: 2000000n,
          }
        );
      },
    },
    getUnits: {
      params: [
        { name: "unit", type: "string" },
        { name: "count", type: "number" },
      ],
      function: async (unit: string, count: number) => {
        const player = mud.network.playerEntity;
        if (!player) throw new Error("No player found");

        const unitEntity = units[unit.toLowerCase()];

        if (!unitEntity) throw new Error("Unit not found");

        const rock = mud.components.Home.get(player)?.asteroid as Entity | undefined;

        if (!rock) throw new Error("No asteroid found");

        await mud.contractCalls.setComponentValue(
          mud.components.UnitCount,
          encodeEntity(mud.components.UnitCount.metadata.keySchema, {
            player: player as Hex,
            unit: unitEntity as Hex,
            rock: rock as Hex,
          }),
          {
            value: BigInt(count),
          }
        );
      },
    },
    getTesterPack: {
      params: [],
      function: async () => {
        const player = mud.network.playerEntity;
        if (!player) throw new Error("No player found");
        for (const resource of [...ResourceStorages]) {
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
        }
        for (const resource of [...ResourceStorages]) {
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
        }
        UtilityStorages.forEach(async (resource) => {
          if (resource == EntityType.VesselCapacity) return;
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
          if (resource == EntityType.VesselCapacity) return;
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
    dripWETH: {
      params: [],
      function: async () => {
        const player = mud.network.address;
        if (!player) throw new Error("No player found");
        await mud.contractCalls.setComponentValue(
          mud.components.WETHBalance,
          encodeEntity({ entity: "address" }, { entity: trim(player) as Hex }),
          {
            value: BigInt(2 * 1e18),
          }
        );
      },
    },
  };
};
