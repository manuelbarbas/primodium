import { WorldAbi } from "@/network/world";
import { createBurnerAccount, transportObserver } from "@latticexyz/common";
import { Entity } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { Cheatcode, Cheatcodes } from "@primodiumxyz/mud-game-tools";
import { EAllianceInviteMode, EPointType, EResource } from "contracts/config/enums";
import { components } from "src/network/components";
import { getNetworkConfig } from "src/network/config/getNetworkConfig";
import { buildBuilding } from "src/network/setup/contractCalls/buildBuilding";
import { createFleet as callCreateFleet } from "src/network/setup/contractCalls/createFleet";
import { setComponentValue } from "src/network/setup/contractCalls/dev";
import { upgradeBuilding as upgradeBuildingCall } from "src/network/setup/contractCalls/upgradeBuilding";
import { MUD } from "src/network/types";
import { encodeEntity, toHex32 } from "src/util/encode";
import { Hex, createWalletClient, fallback, getContract, http, webSocket } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { getEntityTypeName } from "../common";
import {
  BuildingEnumLookup,
  EntityType,
  RESOURCE_SCALE,
  ResourceEntityLookup,
  ResourceEnumLookup,
  UtilityStorages,
} from "../constants";
import { entityToRockName } from "../name";
import { formatResourceCount, parseResourceCount } from "../number";
import { getAsteroidBounds, outOfBounds } from "../outOfBounds";
import { getFullResourceCount } from "../resource";
import { getBuildingAtCoord } from "../tile";
import { TesterPack, testerPacks } from "./testerPacks";
import { PrimodiumGame } from "@/game/api";

export const setupCheatcodes = (mud: MUD, game: PrimodiumGame): Cheatcodes => {
  const {
    UI: { notify },
  } = game;
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
    encryption: EntityType.Encryption,
    colonyShipCapacity: EntityType.ColonyShipCapacity,
  };

  const units: Record<string, Entity> = {
    minuteman: EntityType.MinutemanMarine,
    trident: EntityType.TridentMarine,
    stinger: EntityType.StingerDrone,
    aegis: EntityType.AegisDrone,
    anvil: EntityType.AnvilDrone,
    hammer: EntityType.HammerDrone,
    lightningCraft: EntityType.LightningCraft,
    colonyShip: EntityType.ColonyShip,
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
    const maxResourceCount = components.MaxResourceCount.get(entity)?.value ?? 0n;
    if (maxResourceCount < newResourceCount) {
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
    notify(
      "success",
      `${formatResourceCount(resource, value)} ${getEntityTypeName(resource)} given to ${entityToRockName(spaceRock)}`
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
    if (unit === EntityType.ColonyShip) {
      const colonyShipCap = components.MaxColonySlots.get(mud.playerAccount.entity)?.value ?? 0n;
      await setComponentValue(
        mud,
        components.MaxColonySlots,
        { playerEntity: mud.playerAccount.entity as Hex },
        { value: colonyShipCap + value }
      );
    }
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
      notify("success", `Main Base Level set to ${requiredBaseLevel}`);
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

  async function createFleet(
    units: { unit: Entity; count: number }[],
    resources: { resource: Entity; count: number }[]
  ) {
    const asteroid = mud.components.ActiveRock.get()?.value;
    if (!asteroid) throw new Error("No asteroid found");
    await provideResource(asteroid, EntityType.FleetCount, 1n);
    const unitPromises: Promise<void>[] = [];
    units.map(async ({ unit, count }) => {
      unitPromises.push(provideUnit(asteroid, unit, BigInt(count)));
    });
    resources.map(async ({ resource, count }) => {
      unitPromises.push(provideResource(asteroid, resource, parseResourceCount(resource, count.toString())));
    });
    await Promise.all(unitPromises);
    await callCreateFleet(
      mud,
      asteroid,
      new Map([
        ...(units.map(({ unit, count }) => [unit, BigInt(count)]) as [Entity, bigint][]),
        ...resources.map(
          ({ resource, count }) => [resource, parseResourceCount(resource, count.toString())] as [Entity, bigint]
        ),
      ]),
      { force: true }
    );
  }

  async function upgradeBuilding(building: Entity, level: number | "max" = "max") {
    const position = components.Position.get(building);
    if (!position) {
      notify("error", "No building position ");
      throw new Error("No building position");
    }

    const prototype = components.BuildingType.get(building)?.value ?? EntityType.IronMine;
    let currLevel = components.Level.get(building)?.value ?? 1n;
    let newLevel: bigint;
    if (!level) newLevel = components.Level.get(building)?.value ?? 1n + 1n;
    else if (level === "max") newLevel = components.P_MaxLevel.get(prototype as Entity)?.value ?? 1n;
    else newLevel = BigInt(level);

    if (newLevel < currLevel) {
      notify("error", "Cannot downgrade building");
      throw new Error("Cannot downgrade building");
    }
    while (currLevel < newLevel) {
      await provideBuildingRequiredResources(position.parentEntity as Entity, prototype as Entity, currLevel + 1n);
      await upgradeBuildingCall(mud, building, { force: true });
      currLevel++;
    }
  }

  async function spawnPlayers(count: number) {
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
        abi: WorldAbi,
        client: {
          public: mud.network.publicClient,
          wallet: burnerWalletClient,
        },
      });

      const randomName = Math.random().toString(36).substring(7);
      await worldContract.write.Primodium__spawn();
      await worldContract.write.Primodium__create([
        toHex32(randomName.substring(0, 6).toUpperCase()),
        EAllianceInviteMode.Closed,
      ]);
    }
  }

  async function waitUntilTxQueueEmpty() {
    let txQueueSize = components.TransactionQueue.getSize();
    while (txQueueSize > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      txQueueSize = components.TransactionQueue.getSize();
    }
  }
  function setupTesterPackCheatcodes(testerPacks: Record<string, TesterPack>): Record<string, Cheatcode> {
    return Object.fromEntries(
      Object.entries(testerPacks).map(([name, pack]) => {
        return [
          name,
          {
            params: [],
            function: async () => {
              const start = Date.now();
              notify("info", `running cheatcode: ${name}`);
              // world speed
              pack.worldSpeed &&
                (await setComponentValue(
                  mud,
                  mud.components.P_GameConfig,
                  {},
                  {
                    worldSpeed: BigInt(pack.worldSpeed),
                  }
                ));

              // spawn players
              pack.players && (await spawnPlayers(pack.players));

              const activeAsteroid = mud.components.ActiveRock.get()?.value;
              if (!activeAsteroid) throw new Error("No active asteroid found");
              if (pack.resources) {
                // provide resources
                for (const [resource, count] of pack.resources.entries()) {
                  await provideResource(activeAsteroid, resource, parseResourceCount(resource, count.toString()));
                  await waitUntilTxQueueEmpty();
                }

                notify("success", `${name}:Resources provided`);
              }
              if (pack.storages) {
                // provide resources
                for (const [resource, count] of pack.storages.entries()) {
                  const value = BigInt(count * Number(RESOURCE_SCALE));

                  await setComponentValue(
                    mud,
                    mud.components.MaxResourceCount,
                    { entity: activeAsteroid as Hex, resource: ResourceEnumLookup[resource] },
                    {
                      value,
                    }
                  );
                  await waitUntilTxQueueEmpty();
                }

                notify("success", `${name}:Resources provided`);
              }
              // provide units
              if (pack.units) {
                for (const [unit, count] of pack.units.entries()) {
                  await provideUnit(activeAsteroid, unit, BigInt(count));
                  await waitUntilTxQueueEmpty();
                }
              }
              if (pack.mainBaseLevel) {
                const mainBase = mud.components.Home.get(activeAsteroid)?.value;
                //upgrade main base
                if (mainBase) {
                  await upgradeBuilding(mainBase as Entity, pack.mainBaseLevel);
                }
                await waitUntilTxQueueEmpty();
                notify("success", `${name}: Main Base Level set to ${pack.mainBaseLevel}`);
              }
              // upgrade expansion
              if (pack.expansion) {
                await setComponentValue(
                  mud,
                  mud.components.Level,
                  { entity: activeAsteroid as Hex },
                  {
                    value: BigInt(pack.expansion),
                  }
                );
                await waitUntilTxQueueEmpty();
                notify("success", `${name}:Expansion set to ${pack.expansion}`);
              }
              // build buildings
              if (pack.buildings) {
                const usedCoords: Coord[] = [];
                for (const building of pack.buildings) {
                  await provideBuildingRequiredResources(activeAsteroid, building, 1n);
                  const position = findTilePosition(activeAsteroid, building, usedCoords);
                  usedCoords.push(position);
                  await buildBuilding(mud, BuildingEnumLookup[building], position, {
                    force: true,
                  });
                  await waitUntilTxQueueEmpty();
                }

                await waitUntilTxQueueEmpty();
                notify("success", `${name}:Buildings created`);
              }
              // create fleets
              if (pack.fleets) {
                for (const fleet of pack.fleets) {
                  await createFleet(
                    [...fleet.units.entries()].map(([unit, count]) => ({ unit, count })),
                    [...fleet.resources.entries()].map(([resource, count]) => ({ resource, count }))
                  );
                  await waitUntilTxQueueEmpty();
                }

                notify("success", `${name}:Fleets created`);
              }

              const end = Date.now();
              notify("success", `Cheatcode ${name} ran in ${end - start}ms`);
            },
          },
        ];
      })
    );
  }
  function canPlaceBuildingTiles(
    asteroidEntity: Entity,
    buildingPrototype: Entity,
    position: Coord,
    usedCoords?: Coord[]
  ) {
    const blueprint = components.P_Blueprint.get(buildingPrototype)?.value ?? [];
    const absoluteCoords = [];
    for (let i = 0; i < blueprint.length; i += 2) {
      const relativeCoord = { x: blueprint[i], y: blueprint[i + 1] };
      const absoluteCoord = {
        x: position.x + relativeCoord.x,
        y: position.y + relativeCoord.y,
      };
      absoluteCoords.push(absoluteCoord);
      if (usedCoords?.some((usedCoord) => absoluteCoord.x === usedCoord.x && absoluteCoord.y === usedCoord.y))
        return false;
      if (getBuildingAtCoord(absoluteCoord, asteroidEntity as Entity) || outOfBounds(absoluteCoord, asteroidEntity))
        return false;
    }

    usedCoords?.push(...absoluteCoords);
    return true;
  }

  function findTilePosition(asteroidEntity: Entity, building: Entity, usedCoords?: Coord[]) {
    const mapId = components.Asteroid.get(asteroidEntity)?.mapId ?? 1;
    const bounds = getAsteroidBounds(asteroidEntity);
    for (let i = bounds.minX; i < bounds.maxX; i++) {
      for (let j = bounds.minY; j < bounds.maxY; j++) {
        const coord = { x: i, y: j, asteroidEntity };
        if (usedCoords?.some((usedCoord) => coord.x === usedCoord.x && coord.y === usedCoord.y)) continue;

        if (getBuildingAtCoord(coord, asteroidEntity as Entity)) continue;

        const resource = components.P_RequiredTile.get(building)?.value;
        if (!!resource && resource !== components.P_Terrain.getWithKeys({ mapId, x: coord.x, y: coord.y })?.value)
          continue;
        if (!canPlaceBuildingTiles(asteroidEntity, building, coord, usedCoords)) continue;
        return coord;
      }
    }
    throw new Error("Valid tile position not found");
  }

  const packs = setupTesterPackCheatcodes(testerPacks);
  return [
    {
      title: "Tester Packs",
      content: packs,
    },
    {
      title: "Game Config",
      content: {
        setWorldSpeed: {
          params: [{ name: "value", type: "number" }],
          function: async (value: number) => {
            notify("info", "running cheatcode: Set World Speed");
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
        setUnitDeathLimit: {
          params: [{ name: "value", type: "number" }],
          function: async (value: number) => {
            notify("info", "running cheatcode: Set World Speed");
            await setComponentValue(
              mud,
              mud.components.P_GameConfig,
              {},
              {
                unitDeathLimit: BigInt(value),
              }
            );
          },
        },
        stopGracePeriod: {
          params: [],
          function: async () => {
            notify("info", "running cheatcode: Stop Grace Period");
            setComponentValue(mud, components.P_GracePeriod, {}, { asteroid: 0n });
          },
        },
        givePlayersRandomPoints: {
          params: [
            { name: "leaderboard", type: "dropdown", dropdownOptions: ["shard", "wormhole"] },
            { name: "range", type: "number" },
          ],
          function: async (type: "shard" | "wormhole", range: number) => {
            notify("info", "running cheatcode: Give Players Random Points");
            const allPlayers = components.Spawned.getAll();
            const pointType = type === "shard" ? EPointType.Shard : EPointType.Wormhole;
            allPlayers.forEach((player) => {
              const points = BigInt(Math.floor(Math.random() * range)) * RESOURCE_SCALE;
              setComponentValue(mud, components.Points, { entity: player as Hex, pointType }, { value: points });
            });
          },
        },
        spawnPlayers: {
          params: [{ name: "count", type: "number" }],
          function: async (count: number) => {
            spawnPlayers(count);
          },
        },
      },
    },
    {
      title: "Asteroid",
      content: {
        buildBuilding: {
          params: [{ name: "building", type: "dropdown", dropdownOptions: Object.keys(buildings) }],
          function: async (building: string) => {
            const selectedRock = mud.components.ActiveRock.get()?.value;
            const buildingEntity = buildings[building];
            if (!buildingEntity || !selectedRock) throw new Error("Building not found");

            await provideBuildingRequiredResources(selectedRock, buildingEntity, 1n);
            await buildBuilding(
              mud,
              BuildingEnumLookup[buildingEntity],
              findTilePosition(selectedRock, buildingEntity)
            );
          },
        },
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

            if (!selectedBuilding) {
              notify("error", "No building selected");
              throw new Error("No building selected");
            }
            await upgradeBuilding(selectedBuilding, level == "max" ? "max" : Number(level));
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
            notify("success", "Main Base Level set to " + level);
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
            notify("success", `${count} ${unit} given to ${entityToRockName(rock)}`);
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
            notify("success", `${count} ${resource} given to ${entityToRockName(selectedRock)}`);
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
            notify("success", `${count} ${resource} storage given to ${entityToRockName(selectedRock)}`);
          },
        },
        setResource: {
          params: [
            { name: "count", type: "number" },
            { name: "resource", type: "dropdown", dropdownOptions: Object.keys(resources) },
          ],
          function: async (count: number, resource: string) => {
            const selectedRock = mud.components.SelectedRock.get()?.value;
            const resourceEntity = resources[resource];
            if (!resourceEntity || !selectedRock) throw new Error("Resource not found");

            const value = BigInt(count * Number(RESOURCE_SCALE));

            await setComponentValue(
              mud,
              mud.components.ResourceCount,
              { entity: selectedRock as Hex, resource: ResourceEnumLookup[resourceEntity] },
              {
                value,
              }
            );
            notify("success", `${count} ${resource} set for ${entityToRockName(selectedRock)}`);
          },
        },
        increaseMaxColonySlots: {
          params: [{ name: "count", type: "number" }],
          function: async (count: number) => {
            const player = mud.playerAccount.entity;
            if (!player) throw new Error("No player found");

            const colonyShipCap = components.MaxColonySlots.get(player)?.value ?? 0n;
            await setComponentValue(
              mud,
              components.MaxColonySlots,
              { playerEntity: player as Hex },
              { value: colonyShipCap + BigInt(count) }
            );
            notify("success", `Colony Ship Capacity increased by ${count}`);
          },
        },
        conquerAsteroid: {
          params: [{ name: "baseType", type: "dropdown", dropdownOptions: ["MainBase", "WormholeBase"] }],
          function: async (baseType: string) => {
            const selectedRock = mud.components.SelectedRock.get()?.value;
            if (!selectedRock) {
              notify("error", `No rock selected`);
              throw new Error("No asteroid found");
            }
            notify("info", `Conquering ${entityToRockName(selectedRock)}`);
            const staticData = components.Asteroid.get(selectedRock)?.__staticData;
            if (staticData === "") {
              await createFleet([{ unit: EntityType.LightningCraft, count: 1 }], []);
              notify("error", "Asteroid not initialized. Send fleet to initialize it");
              throw new Error("Asteroid not initialized");
            }
            const entity = baseType == "MainBase" ? EntityType.MainBase : EntityType.WormholeBase;
            const player = mud.playerAccount.entity;
            const colonyShipCap = components.MaxColonySlots.get(player)?.value ?? 0n;
            await setComponentValue(
              mud,
              components.MaxColonySlots,
              { playerEntity: player as Hex },
              { value: colonyShipCap + 1n }
            );
            await setComponentValue(mud, components.OwnedBy, { entity: selectedRock as Hex }, { value: player });
            const position = components.Position.get(entity);
            if (!position) throw new Error("No main base found");
            await buildBuilding(mud, BuildingEnumLookup[entity], { ...position, parentEntity: selectedRock as Hex });
            notify("success", `Asteroid ${entityToRockName(selectedRock)} conquered`);
          },
        },
        conquerAllPrimaryAsteroids: {
          params: [],
          function: async () => {
            const asteroids = mud.components.Asteroid.getAllWith({ spawnsSecondary: true });
            for (const asteroid of asteroids) {
              const position = components.Position.get(asteroid);
              if (!position) continue;
              await setComponentValue(
                mud,
                mud.components.OwnedBy,
                { entity: asteroid as Hex },
                { value: mud.playerAccount.entity }
              );
            }
            notify("success", "All primary asteroids conquered");
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
            notify("success", `Terrain set to ${resource} at [${x}, ${y}]. Reload to see change.`);
          },
        },
      },
    },
    {
      title: "Building",
      content: {
        clearCooldown: {
          params: [],
          function: async () => {
            const selectedBuilding = mud.components.SelectedBuilding.get()?.value;
            if (!selectedBuilding) {
              notify("error", "No building selected");
              throw new Error("No building selected");
            }
            await setComponentValue(
              mud,
              mud.components.CooldownEnd,
              { entity: selectedBuilding as Hex },
              {
                value: 0n,
              }
            );
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
          function: (unit: string, count: number) => {
            createFleet([{ unit: units[unit], count }], []);
          },
        },
        giveFleetUnit: {
          params: [
            { name: "unit", type: "dropdown", dropdownOptions: Object.keys(units) },
            { name: "count", type: "number" },
          ],
          function: async (unit: string, count: number) => {
            const player = mud.playerAccount.entity;
            if (!player) throw new Error("No player found");
            const selectedFleet = mud.components.SelectedFleet.get()?.value;

            const unitEntity = units[unit];

            if (!unitEntity || !selectedFleet) throw new Error("Resource not found");

            await setComponentValue(
              mud,
              mud.components.UnitCount,
              { entity: selectedFleet as Hex, unit: unitEntity as Hex },
              {
                value: BigInt(count),
              }
            );
          },
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
              notify("error", "No fleet selected");
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
