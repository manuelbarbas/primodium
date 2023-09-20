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
  Position,
  Units,
  P_WorldSpeed,
} from "src/network/components/chainComponents";
import { SingletonID } from "@latticexyz/network";
import { Cheatcode, Cheatcodes } from "src/components/dev/Cheatcodes";
import { Network } from "src/network/layer";
import { BlockType } from "./constants";
import {
  Account,
  ActiveAsteroid,
  SelectedBuilding,
  Send,
} from "src/network/components/clientComponents";
import { hashEntities, hashKeyEntity } from "./encode";
import { EntityID } from "@latticexyz/recs";
import { updateSpaceRock } from "./web3/updateSpaceRock";
import { SPEED_SCALE } from "./constants";
const resources: Record<string, EntityID> = {
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
  ironplate: BlockType.IronPlateCrafted,
  platinum: BlockType.Platinum,
  alloy: BlockType.Alloy,
  pvcell: BlockType.PhotovoltaicCell,
  housing: BlockType.HousingUtilityResource,
  vessel: BlockType.VesselUtilityResource,
  electricity: BlockType.ElectricityUtilityResource,
};

const units: Record<string, EntityID> = {
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
      const playerResource = hashKeyEntity(
        resources[resource.toLowerCase()],
        player
      );
      await mud.dev.setEntityContractComponentValue(
        playerResource,
        MaxUtility,
        {
          value: max,
        }
      );
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
      const playerResource = hashKeyEntity(
        resources[resource.toLowerCase()],
        player
      );
      await mud.dev.setEntityContractComponentValue(
        playerResource,
        P_MaxStorage,
        {
          value: max,
        }
      );
    },
  };

  return {
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

        await mud.dev.setEntityContractComponentValue(
          hashKeyEntity(type, level),
          P_ScoreMultiplier,
          {
            value: multiplier,
          }
        );
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
        const asteroid = ActiveAsteroid.get()?.value;
        if (!entity || !asteroid || !resource)
          throw new Error("No unitwith that name");
        const playerResource = hashEntities(resource, entity, asteroid);

        await mud.dev.setEntityContractComponentValue(playerResource, Units, {
          value: count * 100,
        });
      },
    },
    addMinerToDestination: {
      params: [{ name: "count", type: "number" }],
      function: async (count: number) => {
        const destination = Send.getDestination()?.entity;
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
        mud.dev.setEntityContractComponentValue(
          playerResource,
          OccupiedUtilityResource,
          {
            value,
          }
        );
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
        await mud.dev.setEntityContractComponentValue(
          SingletonID,
          P_WorldSpeed,
          {
            value,
          }
        );
      },
    },
  };
};
