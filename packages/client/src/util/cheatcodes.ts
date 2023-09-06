import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Cheatcode, Cheatcodes } from "src/components/dev/Cheatcodes";
import {
  BuildingType,
  Item,
  Level,
  MainBase,
  MaxMoves,
  MaxUtility,
  OccupiedUtilityResource,
  P_MaxStorage,
  P_ScoreMultiplier,
  P_WorldSpeed,
  Position,
  Units,
} from "src/network/components/chainComponents";
import { Account, HomeAsteroid, SelectedBuilding, Send } from "src/network/components/clientComponents";
import { Network } from "src/network/setupNetworkOld";
import { BlockType, ResourceStorages, SPEED_SCALE } from "./constants";
import { hashEntities, hashKeyEntity } from "./encode";
import { updateSpaceRock } from "./web3/updateSpaceRock";
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
  pvcell: BlockType.PhotovoltaicCell,
  housing: BlockType.Housing,
  vessel: BlockType.VesselCapacity,
  electricity: BlockType.Electricity,
};

const units: Record<string, Entity> = {
  stinger: BlockType.StingerDrone,
  aegis: BlockType.AegisDrone,
  anvillight: BlockType.AnvilLightDrone,
  hammerlight: BlockType.HammerLightDrone,
  mining: BlockType.MiningVessel,
};

export const setupCheatcodes = (mud: Network): Cheatcodes => {
  const setMaxUtility: Cheatcode = {
    params: [
      { name: "resource", type: "string" },
      { name: "max", type: "number" },
    ],
    function: async (resource: string, max: number) => {
      const player = Account.get()?.value;
      if (!player) throw new Error("No player found");
      const playerResource = hashKeyEntity(resources[resource.toLowerCase()], player);
      await mud.dev.setEntityContractComponentValue(playerResource, MaxUtility, {
        value: max,
      });
    },
  };

  const setMaxResource: Cheatcode = {
    params: [
      { name: "resource", type: "string" },
      { name: "max", type: "number" },
    ],
    function: async (resource: string, max: number) => {
      const player = Account.get()?.value;
      if (!player) throw new Error("No player found");
      const playerResource = hashKeyEntity(resources[resource.toLowerCase()], player);
      await mud.dev.setEntityContractComponentValue(playerResource, P_MaxStorage, {
        value: max,
      });
    },
  };

  const getResourcePack: Cheatcode = {
    params: [],
    function: async () => {
      ResourceStorages.forEach(async (resource) => {
        const player = Account.get()?.value;
        if (!player) throw new Error("No player found");
        const playerResource = hashKeyEntity(resource, player);

        await mud.dev.setEntityContractComponentValue(playerResource, P_MaxStorage, {
          value: 100000 * 100,
        });

        await mud.dev.setEntityContractComponentValue(playerResource, Item, {
          value: 100000 * 100,
        });
      });
    },
  };

  const getUtilityPack: Cheatcode = {
    params: [],
    function: async () => {
      [BlockType.Housing, BlockType.Electricity].forEach(async (resource) => {
        const player = Account.get()?.value;
        if (!player) throw new Error("No player found");
        const playerResource = hashKeyEntity(resource, player);

        await mud.dev.setEntityContractComponentValue(playerResource, MaxUtility, {
          value: 10000,
        });

        mud.dev.setEntityContractComponentValue(playerResource, OccupiedUtilityResource, {
          value: 0,
        });
      });
    },
  };

  return {
    getUtilityPack,
    getResourcePack,
    setMaxUtility,
    setMaxResource,
    maxMainBase: {
      params: [],
      function: async () => {
        const entity = Account.get()?.value;
        const building = MainBase.get(entity)?.value;
        if (!building) throw new Error("No main base found for player");

        await mud.dev.setEntityContractComponentValue(building, Level, {
          value: 6,
        });
      },
    },
    setMultiplier: {
      params: [{ name: "multiplier", type: "number" }],
      function: async (multiplier: number) => {
        const building = SelectedBuilding.get()?.value;
        const type = BuildingType.get(building)?.value;
        const level = Level.get(building)?.value;
        if (!type || !level) throw new Error("No player found");

        await mud.dev.setEntityContractComponentValue(hashKeyEntity(type, level), P_ScoreMultiplier, {
          value: multiplier,
        });
      },
    },
    updateSpaceRock: {
      params: [],
      function: async () => {
        await updateSpaceRock(mud);
      },
    },
    giveResource: {
      params: [
        { name: "name", type: "string" },
        { name: "count", type: "number" },
      ],
      function: async (name: string, count: number) => {
        const entity = Account.get()?.value;
        const resource = resources[name.toLowerCase()];
        if (!entity) throw new Error("No resource with that name");
        const playerResource = hashKeyEntity(resource, entity);

        await mud.dev.setEntityContractComponentValue(playerResource, Item, {
          value: count * 100,
        });
      },
    },
    giveUnit: {
      params: [
        { name: "name", type: "string" },
        { name: "count", type: "number" },
      ],
      function: async (name: string, count: number) => {
        const entity = Account.get()?.value;
        const resource = units[name.toLowerCase()];
        const asteroid = HomeAsteroid.get()?.value;
        if (!entity || !asteroid || !resource) throw new Error("No unitwith that name");
        const playerResource = hashEntities(resource, entity, asteroid);

        await mud.dev.setEntityContractComponentValue(playerResource, Units, {
          value: count * 100,
        });
      },
    },
    addMinerToDestination: {
      params: [{ name: "count", type: "number" }],
      function: async (count: number) => {
        const destination = Send.get()?.destination;
        if (!destination) throw new Error("No destination set");
        console.log("destination", Position.get(destination));
        const entity = Account.get()?.value;
        const resource = BlockType.MiningVessel;
        if (!entity) throw new Error("No player");

        const playerResource = hashEntities(resource, entity, destination);
        await mud.dev.setEntityContractComponentValue(playerResource, Units, {
          value: count,
        });
      },
    },
    setUtility: {
      params: [
        { name: "utility", type: "string" },
        { name: "value", type: "number" },
      ],
      function: (name: string, value: number) => {
        const player = Account.get()?.value;
        if (!player) throw new Error("No player found");
        const playerResource = hashKeyEntity(resources[name], player);
        mud.dev.setEntityContractComponentValue(playerResource, OccupiedUtilityResource, {
          value,
        });
      },
    },

    increaseMaxMoves: {
      params: [{ name: "value", type: "number" }],
      function: async (value: number) => {
        const player = Account.get()?.value;
        if (!player) throw new Error("No player found");
        await mud.dev.setEntityContractComponentValue(player, MaxMoves, {
          value,
        });
      },
    },

    setWorldSpeed: {
      params: [{ name: "value", type: "number" }],
      function: async (value: number) => {
        value = SPEED_SCALE / value;
        await mud.dev.setEntityContractComponentValue(singletonEntity, P_WorldSpeed, {
          value,
        });
      },
    },
  };
};
