import { Primodium } from "@game/api";
import { Scenes } from "@game/constants";
import { createBurnerAccount, transportObserver } from "@latticexyz/common";
import { Entity } from "@latticexyz/recs";
import { Cheatcodes } from "@primodiumxyz/mud-game-tools";
import { EBuilding, EResource } from "contracts/config/enums";
import encodeBytes32 from "contracts/config/util/encodeBytes32";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { toast } from "react-toastify";
import { components } from "src/network/components";
import { getNetworkConfig } from "src/network/config/getNetworkConfig";
import { buildBuilding } from "src/network/setup/contractCalls/buildBuilding";
import { createFleet as callCreateFleet } from "src/network/setup/contractCalls/createFleet";
import { setComponentValue } from "src/network/setup/contractCalls/dev";
import { upgradeBuilding } from "src/network/setup/contractCalls/upgradeBuilding";
import { MUD } from "src/network/types";
import { encodeEntity, hashEntities, hashKeyEntity, toHex32 } from "src/util/encode";
import { Hex, createWalletClient, fallback, getContract, http, webSocket } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { getBlockTypeName } from "../common";
import {
  EntityType,
  PIRATE_KEY,
  RESOURCE_SCALE,
  ResourceEntityLookup,
  ResourceEnumLookup,
  UtilityStorages,
} from "../constants";
import { entityToRockName } from "../name";
import { formatResourceCount } from "../number";
import { getFullResourceCount } from "../resource";

export const setupCheatcodes = (mud: MUD, primodium: Primodium): Cheatcodes => {
  const buildings: Record<string, Entity> = {
    mainbase: EntityType.MainBase,
    droidbase: EntityType.DroidBase,

    // Basic Buildings
    ironMine: EntityType.IronMine,
    copperMine: EntityType.CopperMine,
    lithiumMine: EntityType.LithiumMine,
    kimberliteMine: EntityType.KimberliteMine,
    titaniumMine: EntityType.TitaniumMine,
    platinumMine: EntityType.PlatinumMine,
    iridiumMine: EntityType.IridiumMine,

    storageUnit: EntityType.StorageUnit,
    garage: EntityType.Garage,
    workshop: EntityType.Workshop,

    //Advanced Buildings
    ironPlateFactory: EntityType.IronPlateFactory,
    pvellFactory: EntityType.PVCellFactory,
    alloyFactory: EntityType.AlloyFactory,
    solarPanel: EntityType.SolarPanel,
    hangar: EntityType.Hangar,
    droneFactory: EntityType.DroneFactory,
    starmapperStation: EntityType.StarmapperStation,
    samLauncher: EntityType.SAMLauncher,
    shieldGenerator: EntityType.ShieldGenerator,
    vault: EntityType.Vault,
    market: EntityType.Market,
    shipyard: EntityType.Shipyard,
  };
  const resources: Record<string, Entity> = {
    iron: EntityType.Iron,
    copper: EntityType.Copper,
    lithium: EntityType.Lithium,
    titanium: EntityType.Titanium,
    iridium: EntityType.Iridium,
    kimberlite: EntityType.Kimberlite,
    ironplate: EntityType.IronPlate,
    platinum: EntityType.Platinum,
    alloy: EntityType.Alloy,
    pvcell: EntityType.PVCell,
    housing: EntityType.Housing,
    vessel: EntityType.VesselCapacity,
    electricity: EntityType.Electricity,
    defense: EntityType.Defense,
    moves: EntityType.FleetCount,
  };

  const units: Record<string, Entity> = {
    stinger: EntityType.StingerDrone,
    aegis: EntityType.AegisDrone,
    anvil: EntityType.AnvilDrone,
    hammer: EntityType.HammerDrone,
    capitalShip: EntityType.CapitalShip,
    droid: EntityType.Droid,
  };

  const provideResource = async (spaceRock: Entity, resource: Entity, value: bigint) => {
    const resourceIndex = ResourceEnumLookup[resource];
    const systemCalls: Promise<unknown>[] = [];
    const entity = encodeEntity(components.ProductionRate.metadata.keySchema, {
      entity: spaceRock as Hex,
      resource: resourceIndex,
    });
    const currentResourceCount = components.ResourceCount.get(entity)?.value ?? 0n;
    const newResourceCount = currentResourceCount + value;
    if (components.MaxResourceCount.get(entity)?.value ?? 0n < newResourceCount) {
      systemCalls.push(
        setComponentValue(
          mud,
          mud.components.MaxResourceCount,
          { entity: spaceRock as Hex, resource: resourceIndex },
          {
            value: newResourceCount,
          }
        )
      );
    }
    systemCalls.push(
      setComponentValue(
        mud,
        mud.components.ResourceCount,
        { entity: spaceRock as Hex, resource: resourceIndex },
        {
          value: newResourceCount,
        }
      )
    );
    await Promise.all(systemCalls);
    toast.success(
      `${formatResourceCount(resource, value)} ${getBlockTypeName(resource)} given to ${entityToRockName(spaceRock)}`
    );
  };

  const provideUnit = async (spaceRock: Entity, unit: Entity, value: bigint) => {
    const level = components.UnitLevel.getWithKeys({ unit: unit as Hex, entity: spaceRock as Hex })?.value ?? 1n;

    const unitRequiredResources = getTrainCost(unit, level, value);

    [...unitRequiredResources.entries()].map(async ([resource, count]) => {
      if (!UtilityStorages.has(resource)) return;
      const { resourceStorage } = getFullResourceCount(resource, spaceRock);

      await setComponentValue(
        mud,
        mud.components.MaxResourceCount,
        { entity: spaceRock as Hex, resource: ResourceEnumLookup[resource as Entity] },
        {
          value: resourceStorage + count,
        }
      );
    });

    const prevUnitCount =
      components.UnitCount.getWithKeys({ unit: unit as Hex, entity: spaceRock as Hex })?.value ?? 0n;
    await setComponentValue(
      mud,
      mud.components.UnitCount,
      {
        entity: spaceRock as Hex,
        unit: unit as Hex,
      },
      {
        value: value + prevUnitCount,
      }
    );
  };

  const provideBuildingRequiredResources = async (spaceRock: Entity, building: Entity, level: bigint) => {
    const requiredBaseLevel =
      components.P_RequiredBaseLevel.getWithKeys({ prototype: building as Hex, level })?.value ?? 0n;
    const mainBase = mud.components.Home.get(spaceRock)?.value as Entity | undefined;
    if (requiredBaseLevel > (components.Level.get(mainBase)?.value ?? 0n)) {
      await setComponentValue(
        mud,
        mud.components.Level,
        { entity: mainBase as Hex },
        {
          value: requiredBaseLevel,
        }
      );
      toast.success(`Main Base Level set to ${requiredBaseLevel}`);
    }
    const requiredResources = components.P_RequiredResources.getWithKeys({ prototype: building as Hex, level });
    if (!requiredResources) return;
    for (let i = 0; i < requiredResources.resources.length; i++) {
      const resource = ResourceEntityLookup[requiredResources.resources[i] as EResource];
      await provideResource(spaceRock, resource, requiredResources.amounts[i]);
    }
  };

  function getTrainCost(unitPrototype: Entity, level: bigint, count: bigint) {
    const requiredResources = components.P_RequiredResources.getWithKeys({ prototype: unitPrototype as Hex, level });
    const ret: Map<Entity, bigint> = new Map();
    if (!requiredResources) return ret;
    for (let i = 0; i < requiredResources.resources.length; i++) {
      const resource = ResourceEntityLookup[requiredResources.resources[i] as EResource];
      ret.set(resource, requiredResources.amounts[i] * count);
    }
    return ret;
  }

  async function createFleet(unit: Entity, count: number) {
    const asteroid = mud.components.ActiveRock.get()?.value;
    if (!asteroid) throw new Error("No asteroid found");
    await provideResource(asteroid, EntityType.FleetCount, 1n);
    await provideUnit(asteroid, unit, BigInt(count));
    await callCreateFleet(mud, asteroid, new Map([[unit, BigInt(count)]]));
  }

  return [
    {
      title: "Tester Packs",
      content: {
        beginnerTesterPack: {
          params: [],
          function: async () => {},
        },
      },
    },
    {
      title: "Game Config",
      content: {
        setWorldSpeed: {
          params: [{ name: "value", type: "number" }],
          function: async (value: number) => {
            toast.info("running cheatcode: Set World Speed");
            await setComponentValue(
              mud,
              mud.components.P_GameConfig,
              {},
              {
                worldSpeed: BigInt(value),
              }
            );
          },
        },
        stopGracePeriod: {
          params: [],
          function: async () => {
            toast.info("running cheatcode: Stop Grace Period");
            setComponentValue(mud, components.P_GracePeriod, {}, { spaceRock: 0n });
          },
        },
        spawnPlayers: {
          params: [{ name: "count", type: "number" }],
          function: async (count: number) => {
            toast.info("running cheatcode: Spawn Players");
            const networkConfig = getNetworkConfig();
            const clientOptions = {
              chain: networkConfig.chain,
              transport: transportObserver(fallback([webSocket(), http()])),
              pollingInterval: 1000,
            };

            for (let i = 0; i < count; i++) {
              const privateKey = generatePrivateKey();
              const burnerAccount = createBurnerAccount(privateKey as Hex);

              const burnerWalletClient = createWalletClient({
                ...clientOptions,
                account: burnerAccount,
              });

              const worldContract = getContract({
                address: networkConfig.worldAddress as Hex,
                abi: IWorldAbi,
                publicClient: mud.network.publicClient,
                walletClient: burnerWalletClient,
              });

              await worldContract.write.spawn();
            }
          },
        },
      },
    },
    {
      title: "Asteroid",
      content: {
        upgradeBuilding: {
          params: [
            {
              name: "level",
              type: "dropdown",
              dropdownOptions: ["1", "2", "3", "4", "5", "6", "7", "8", "max"].reverse(),
            },
          ],
          function: async (level?: string) => {
            const selectedBuilding = mud.components.SelectedBuilding.get()?.value;

            const position = components.Position.get(selectedBuilding);
            if (!position || !selectedBuilding) {
              toast.error("No building selected");
              throw new Error("No building selected");
            }

            const prototype = components.BuildingType.get(selectedBuilding)?.value ?? EntityType.IronMine;
            let currLevel = components.Level.get(selectedBuilding)?.value ?? 1n;
            let newLevel: bigint;
            if (!level) newLevel = components.Level.get(selectedBuilding)?.value ?? 1n + 1n;
            else if (level === "max") newLevel = components.P_MaxLevel.get(prototype as Entity)?.value ?? 1n;
            else newLevel = BigInt(level);

            if (newLevel < currLevel) {
              toast.error("Cannot downgrade building");
              throw new Error("Cannot downgrade building");
            }
            while (currLevel < newLevel) {
              await provideBuildingRequiredResources(position.parent as Entity, prototype as Entity, currLevel + 1n);
              await upgradeBuilding(mud, position, { force: true });
              currLevel++;
            }
            toast.success("Building Level set to " + newLevel);
          },
        },
        setExpansion: {
          params: [
            { name: "level", type: "dropdown", dropdownOptions: ["1", "2", "3", "4", "5", "6", "7", "8"].reverse() },
          ],
          function: async (level: string) => {
            const selectedRock = mud.components.ActiveRock.get()?.value;
            if (!selectedRock) throw new Error("No rock found");
            await setComponentValue(
              mud,
              mud.components.Level,
              { entity: selectedRock as Hex },
              {
                value: BigInt(level),
              }
            );
            toast.success("Main Base Level set to " + level);
          },
        },

        setupBuildBuilding: {
          params: [{ name: "building", type: "dropdown", dropdownOptions: Object.keys(buildings) }],
          function: async (building: string) => {
            const selectedRock = mud.components.ActiveRock.get()?.value;
            const buildingEntity = buildings[building];
            if (!buildingEntity || !selectedRock) throw new Error("Building not found");

            await provideBuildingRequiredResources(selectedRock, buildingEntity, 1n);
          },
        },
        addUnit: {
          params: [
            { name: "unit", type: "dropdown", dropdownOptions: Object.keys(units) },
            { name: "count", type: "number" },
          ],
          function: async (unit: string, count: number) => {
            const unitEntity = units[unit];

            if (!unitEntity) throw new Error("Unit not found");

            const rock = mud.components.ActiveRock.get()?.value;
            if (!rock) throw new Error("No asteroid found");
            provideUnit(rock, unitEntity, BigInt(count));
            toast.success(`${count} ${unit} given to ${entityToRockName(rock)}`);
          },
        },
        addResource: {
          params: [
            { name: "resource", type: "dropdown", dropdownOptions: Object.keys(resources) },
            { name: "count", type: "number" },
          ],
          function: async (resource: string, count: number) => {
            const player = mud.playerAccount.entity;
            if (!player) throw new Error("No player found");
            const selectedRock = mud.components.ActiveRock.get()?.value;

            const resourceEntity = resources[resource];

            if (!resourceEntity || !selectedRock) throw new Error("Resource not found");
            provideResource(selectedRock, resourceEntity, BigInt(count * Number(RESOURCE_SCALE)));
            toast.success(`${count} ${resource} given to ${entityToRockName(selectedRock)}`);
          },
        },
        setStorage: {
          params: [
            { name: "resource", type: "dropdown", dropdownOptions: Object.keys(resources) },
            { name: "count", type: "number" },
          ],
          function: async (resource: string, count: number) => {
            const player = mud.playerAccount.entity;
            if (!player) throw new Error("No player found");

            const selectedRock = mud.components.ActiveRock.get()?.value;
            const resourceEntity = resources[resource];

            if (!resourceEntity || !selectedRock) throw new Error("Resource not found");

            const value = BigInt(count * Number(RESOURCE_SCALE));

            await setComponentValue(
              mud,
              mud.components.MaxResourceCount,
              { entity: selectedRock as Hex, resource: ResourceEnumLookup[resourceEntity] },
              {
                value,
              }
            );
            toast.success(`${count} ${resource} storage given to ${entityToRockName(selectedRock)}`);
          },
        },
        conquerAsteroid: {
          params: [],
          function: async () => {
            const selectedRock = mud.components.SelectedRock.get()?.value;
            if (!selectedRock) {
              toast.error(`No rock selected`);
              throw new Error("No asteroid found");
            }
            toast.info(`Conquering ${entityToRockName(selectedRock)}`);
            const staticData = components.Asteroid.get(selectedRock)?.__staticData;
            if (staticData === "") {
              await createFleet(EntityType.LightningCraft, 1);
              toast.error("Asteroid not initialized. Send fleet to initialize it");
              throw new Error("Asteroid not initialized");
            }
            const player = mud.playerAccount.entity;
            await setComponentValue(mud, components.OwnedBy, { entity: selectedRock as Hex }, { value: player });
            const position = components.Position.get(toHex32("MainBase") as Entity);
            if (!position) throw new Error("No main base found");
            await buildBuilding(mud, EBuilding.MainBase, { ...position, parent: selectedRock as Hex });
            toast.success(`Asteroid ${entityToRockName(selectedRock)} conquered`);
          },
        },

        createPirateAsteroid: {
          params: [],
          function: async () => {
            const playerEntity = mud.playerAccount.entity;
            const asteroid = components.ActiveRock.get()?.value;
            const ownerEntity = hashKeyEntity(PIRATE_KEY, playerEntity);
            const asteroidEntity = hashEntities(ownerEntity);
            const homePromise = setComponentValue(
              mud,
              components.Home,
              { entity: ownerEntity as Hex },
              { value: asteroidEntity as Hex }
            );
            const position = components.Position.get(asteroid);
            const coord = { x: (position?.x ?? 0) + 10, y: (position?.y ?? 0) + 10, parent: encodeBytes32("0") };

            await setComponentValue(
              mud,
              components.PirateAsteroid,
              { entity: asteroidEntity as Hex },
              {
                isDefeated: false,
                isPirateAsteroid: true,
                prototype: encodeBytes32("0"),
                playerEntity: playerEntity,
              }
            );

            const positionPromise = setComponentValue(
              mud,
              components.Position,
              { entity: asteroidEntity as Hex },
              coord
            );
            const asteroidPromise = setComponentValue(
              mud,
              components.Asteroid,
              { entity: asteroidEntity as Hex },
              { isAsteroid: true }
            );

            const reversePositionPromise = setComponentValue(
              mud,
              components.ReversePosition,
              {
                x: coord.x,
                y: coord.y,
              },
              {
                entity: asteroidEntity as Hex,
              }
            );
            const ownedByPromise = setComponentValue(
              mud,
              components.OwnedBy,
              { entity: asteroidEntity as Hex },
              { value: ownerEntity }
            );

            await Promise.all([homePromise, positionPromise, reversePositionPromise, asteroidPromise, ownedByPromise]);

            await setComponentValue(
              mud,
              components.PirateAsteroid,
              { entity: asteroidEntity as Hex },
              {
                isDefeated: false,
              }
            );
            toast.success("Pirate asteroid created");
            primodium.api(Scenes.Starmap).camera.pan(coord);
          },
        },
        setTerrain: {
          params: [
            { name: "resource", type: "dropdown", dropdownOptions: Object.keys(resources) },
            { name: "x", type: "number" },
            { name: "y", type: "number" },
          ],
          function: async (resource: string, x: number, y: number) => {
            const selectedRock = mud.components.ActiveRock.get()?.value;
            const resourceEntity = resources[resource];
            const mapId = components.Asteroid.get(selectedRock)?.mapId ?? 1;

            if (!resourceEntity || !selectedRock) throw new Error("Resource not found");

            await setComponentValue(
              mud,
              mud.components.P_Terrain,
              { mapId, x, y },
              {
                value: ResourceEnumLookup[resourceEntity],
              }
            );
            toast.success(`Terrain set to ${resource} at [${x}, ${y}]. Reload to see change.`);
          },
        },
      },
    },

    {
      title: "Fleet",
      content: {
        createFleet: {
          params: [
            { name: "unit", type: "dropdown", dropdownOptions: Object.keys(units) },
            { name: "count", type: "number" },
          ],
          function: createFleet,
        },
        giveFleetResource: {
          params: [
            { name: "resource", type: "dropdown", dropdownOptions: Object.keys(resources) },
            { name: "count", type: "number" },
          ],
          function: async (resource: string, count: number) => {
            const player = mud.playerAccount.entity;
            if (!player) throw new Error("No player found");
            const selectedFleet = mud.components.SelectedFleet.get()?.value;

            const resourceEntity = resources[resource];

            if (!resourceEntity || !selectedFleet) throw new Error("Resource not found");

            const value = BigInt(count * Number(RESOURCE_SCALE));

            await setComponentValue(
              mud,
              mud.components.ResourceCount,
              { entity: selectedFleet as Hex, resource: ResourceEnumLookup[resourceEntity] },
              {
                value,
              }
            );
          },
        },
        setFleetCooldown: {
          params: [{ name: "value", type: "number" }],
          function: async (value: number) => {
            const timestamp = (components.Time.get()?.value ?? 0n) + BigInt(value);
            const selectedFleet = mud.components.SelectedFleet.get()?.value;
            if (!selectedFleet) {
              toast.error("No fleet selected");
              throw new Error("No fleet selected");
            }
            await setComponentValue(
              mud,
              mud.components.CooldownEnd,
              { entity: selectedFleet as Hex },
              {
                value: BigInt(timestamp),
              }
            );
          },
        },
      },
    },
    {
      title: "Alliance",
      content: {
        setMaxAllianceCount: {
          params: [{ name: "value", type: "number" }],
          function: async (value: number) => {
            await setComponentValue(
              mud,
              mud.components.P_AllianceConfig,
              {},
              {
                maxAllianceMembers: BigInt(value),
              }
            );
          },
        },
      },
    },
  ];
};
