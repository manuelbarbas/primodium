import { createBurnerAccount, transportObserver } from "@latticexyz/common";
import { Coord } from "@primodiumxyz/engine/types";
import { Entity } from "@primodiumxyz/reactive-tables";
import { Cheatcode, Cheatcodes } from "@primodiumxyz/mud-game-tools";
import { EAllianceInviteMode, EPointType, EResource } from "contracts/config/enums";
import { Address, Hex, createWalletClient, fallback, getContract, http, webSocket } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { waitForTransactionReceipt } from "viem/actions";
import { TesterPack, testerPacks } from "./testerPacks";
import { PrimodiumGame } from "@primodiumxyz/game/src/types";
import {
  AccountClient,
  BuildingEnumLookup,
  Core,
  entityToRockName,
  EntityType,
  formatResourceCount,
  getEntityTypeName,
  parseResourceCount,
  RESOURCE_SCALE,
  ResourceEntityLookup,
  ResourceEnumLookup,
  toHex32,
  UtilityStorages,
  WorldAbi,
} from "@primodiumxyz/core";
import { encodeEntity } from "@primodiumxyz/reactive-tables/utils";
import { ContractCalls } from "@/contractCalls/createContractCalls";

export const setupCheatcodes = (
  { tables, utils, config, network }: Core,
  { playerAccount, sessionAccount }: AccountClient,
  calls: ContractCalls,
  game: PrimodiumGame,
  requestDrip?: (address: Address) => Promise<void>
): Cheatcodes => {
  const {
    UI: { notify },
  } = game;
  const {
    setTableValue,
    createFleet: createFleetCall,
    upgradeBuilding: upgradeBuildingCall,
    buildBuilding: buildBuildingCall,
  } = calls;
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
    electricity: EntityType.Electricity,
    defense: EntityType.Defense,
    fleetCount: EntityType.FleetCount,
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
    const entity = encodeEntity(tables.ProductionRate.metadata.abiKeySchema, {
      entity: spaceRock as Hex,
      resource: resourceIndex,
    });
    const currentResourceCount = tables.ResourceCount.get(entity)?.value ?? 0n;
    const newResourceCount = currentResourceCount + value;
    const maxResourceCount = tables.MaxResourceCount.get(entity)?.value ?? 0n;
    if (maxResourceCount < newResourceCount) {
      systemCalls.push(
        setTableValue(
          tables.MaxResourceCount,
          { entity: spaceRock as Hex, resource: resourceIndex },
          {
            value: newResourceCount,
          }
        )
      );
    }
    systemCalls.push(
      setTableValue(
        tables.ResourceCount,
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
    const level = tables.UnitLevel.getWithKeys({ unit: unit as Hex, entity: spaceRock as Hex })?.value ?? 1n;

    const unitRequiredResources = getTrainCost(unit, level, value);

    [...unitRequiredResources.entries()].map(async ([resource, count]) => {
      if (!UtilityStorages.has(resource)) return;
      const { resourceStorage } = utils.getResourceCount(resource, spaceRock);

      await setTableValue(
        tables.MaxResourceCount,
        { entity: spaceRock as Hex, resource: ResourceEnumLookup[resource as Entity] },
        {
          value: resourceStorage + count,
        }
      );
    });
    if (unit === EntityType.ColonyShip) {
      const colonyShipCap = tables.MaxColonySlots.get(playerAccount.entity)?.value ?? 0n;
      await setTableValue(
        tables.MaxColonySlots,
        { playerEntity: playerAccount.entity as Hex },
        { value: colonyShipCap + value }
      );
    }
    const prevUnitCount = tables.UnitCount.getWithKeys({ unit: unit as Hex, entity: spaceRock as Hex })?.value ?? 0n;
    await setTableValue(
      tables.UnitCount,
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
      tables.P_RequiredBaseLevel.getWithKeys({ prototype: building as Hex, level })?.value ?? 0n;
    const mainBase = tables.Home.get(spaceRock)?.value as Entity | undefined;
    if (requiredBaseLevel > (tables.Level.get(mainBase)?.value ?? 0n)) {
      await setTableValue(
        tables.Level,
        { entity: mainBase as Hex },
        {
          value: requiredBaseLevel,
        }
      );
      notify("success", `Main Base Level set to ${requiredBaseLevel}`);
    }
    const requiredResources = tables.P_RequiredResources.getWithKeys({ prototype: building as Hex, level });
    if (!requiredResources) return;
    for (let i = 0; i < requiredResources.resources.length; i++) {
      const resource = ResourceEntityLookup[requiredResources.resources[i] as EResource];
      await provideResource(spaceRock, resource, requiredResources.amounts[i]);
    }
  };

  function getTrainCost(unitPrototype: Entity, level: bigint, count: bigint) {
    const requiredResources = tables.P_RequiredResources.getWithKeys({ prototype: unitPrototype as Hex, level });
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
    const asteroid = tables.ActiveRock.get()?.value;
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
    await createFleetCall(
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
    const position = tables.Position.get(building);
    if (!position) {
      notify("error", "No building position ");
      throw new Error("No building position");
    }

    const prototype = tables.BuildingType.get(building)?.value ?? EntityType.IronMine;
    let currLevel = tables.Level.get(building)?.value ?? 1n;
    let newLevel: bigint;
    if (!level) newLevel = tables.Level.get(building)?.value ?? 1n + 1n;
    else if (level === "max") newLevel = tables.P_MaxLevel.get(prototype as Entity)?.value ?? 1n;
    else newLevel = BigInt(level);

    if (newLevel < currLevel) {
      notify("error", "Cannot downgrade building");
      throw new Error("Cannot downgrade building");
    }
    while (currLevel < newLevel) {
      await provideBuildingRequiredResources(position.parentEntity as Entity, prototype as Entity, currLevel + 1n);
      await upgradeBuildingCall(building, { force: true });
      currLevel++;
    }
  }

  async function spawnPlayers(count: number) {
    const clientOptions = {
      chain: config.chain,
      transport: transportObserver(fallback([webSocket(config.chain.rpcUrls.default.http[0]), http()])),
      pollingInterval: 1000,
    };

    const walletClients = Array.from({ length: count }, () => {
      const privateKey = generatePrivateKey();
      const burnerAccount = createBurnerAccount(privateKey as Hex);

      return createWalletClient({
        ...clientOptions,
        account: burnerAccount,
      });
    });

    // prepare enough ETH to each account for spawning if on caldera sepolia
    if (requestDrip && config.chain.id === 10017) {
      const playerAddress = sessionAccount?.address ?? playerAccount.address;
      const requiredAmountToSpawn = BigInt(1e14);

      let balance = await network.publicClient.getBalance({ address: playerAddress });
      while (balance < requiredAmountToSpawn * BigInt(count)) {
        console.log("Not enough balance to spawn players, dripping funds");
        await requestDrip(playerAddress);
        balance = await network.publicClient.getBalance({ address: playerAddress });
      }
    }

    for (let i = 0; i < count; i++) {
      const burnerWalletClient = walletClients[i];
      // send some ETH to the burner account for spawning if on caldera sepolia
      if (config.chain.id === 10017) {
        const player = sessionAccount ?? playerAccount;
        const hash = await player.walletClient.sendTransaction({
          to: burnerWalletClient.account.address,
          value: BigInt(1e14),
        });
        await waitForTransactionReceipt(network.publicClient, { hash });
      }

      const worldContract = getContract({
        address: config.worldAddress as Hex,
        abi: WorldAbi,
        client: {
          public: network.publicClient,
          wallet: burnerWalletClient,
        },
      });

      const randomName = Math.random().toString(36).substring(7);
      await worldContract.write.Pri_11__spawn();
      await worldContract.write.Pri_11__create([
        toHex32(randomName.substring(0, 6).toUpperCase()),
        EAllianceInviteMode.Closed,
      ]);
    }
  }

  async function waitUntilTxQueueEmpty() {
    let txQueueSize = tables.TransactionQueue.getSize();
    while (txQueueSize > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      txQueueSize = tables.TransactionQueue.getSize();
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
                (await setTableValue(
                  tables.P_GameConfig,
                  {},
                  {
                    worldSpeed: BigInt(pack.worldSpeed),
                  }
                ));

              // spawn players
              pack.players && (await spawnPlayers(pack.players));

              const activeAsteroid = tables.ActiveRock.get()?.value;
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

                  await setTableValue(
                    tables.MaxResourceCount,
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
                const mainBase = tables.Home.get(activeAsteroid)?.value;
                //upgrade main base
                if (mainBase) {
                  await upgradeBuilding(mainBase as Entity, pack.mainBaseLevel);
                }
                await waitUntilTxQueueEmpty();
                notify("success", `${name}: Main Base Level set to ${pack.mainBaseLevel}`);
              }
              // upgrade expansion
              if (pack.expansion) {
                await setTableValue(
                  tables.Level,
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
                  await buildBuildingCall(BuildingEnumLookup[building], position, {
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
    const blueprint = tables.P_Blueprint.get(buildingPrototype)?.value ?? [];
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
      if (
        utils.getBuildingAtCoord(absoluteCoord, asteroidEntity as Entity) ||
        utils.outOfBounds(absoluteCoord, asteroidEntity)
      )
        return false;
    }

    usedCoords?.push(...absoluteCoords);
    return true;
  }

  function findTilePosition(asteroidEntity: Entity, building: Entity, usedCoords?: Coord[]) {
    const mapId = tables.Asteroid.get(asteroidEntity)?.mapId ?? 1;
    const bounds = utils.getAsteroidBounds(asteroidEntity);
    for (let i = bounds.minX; i < bounds.maxX; i++) {
      for (let j = bounds.minY; j < bounds.maxY; j++) {
        const coord = { x: i, y: j, asteroidEntity };
        if (usedCoords?.some((usedCoord) => coord.x === usedCoord.x && coord.y === usedCoord.y)) continue;

        if (utils.getBuildingAtCoord(coord, asteroidEntity as Entity)) continue;

        const resource = tables.P_RequiredTile.get(building)?.value;
        if (!!resource && resource !== tables.P_Terrain.getWithKeys({ mapId, x: coord.x, y: coord.y })?.value) continue;
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
            await setTableValue(
              tables.P_GameConfig,
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
            await setTableValue(
              tables.P_GameConfig,
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
            setTableValue(tables.P_GracePeriod, {}, { asteroid: 0n });
          },
        },
        givePlayersRandomPoints: {
          params: [
            { name: "leaderboard", type: "dropdown", dropdownOptions: ["shard", "wormhole"] },
            { name: "range", type: "number" },
          ],
          function: async (type: "shard" | "wormhole", range: number) => {
            notify("info", "running cheatcode: Give Players Random Points");
            const allPlayers = tables.Spawned.getAll();
            const pointType = type === "shard" ? EPointType.Shard : EPointType.Wormhole;
            allPlayers.forEach((player) => {
              const points = BigInt(Math.floor(Math.random() * range)) * RESOURCE_SCALE;
              setTableValue(tables.Points, { entity: player as Hex, pointType }, { value: points });
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
        setExpansion: {
          params: [
            { name: "level", type: "dropdown", dropdownOptions: ["1", "2", "3", "4", "5", "6", "7", "8"].reverse() },
          ],
          function: async (level: string) => {
            const selectedRock = tables.ActiveRock.get()?.value;
            if (!selectedRock) throw new Error("No rock found");
            await setTableValue(
              tables.Level,
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

            const rock = tables.ActiveRock.get()?.value;
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
            const player = playerAccount.entity;
            if (!player) throw new Error("No player found");
            const selectedRock = tables.ActiveRock.get()?.value;

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
            const player = playerAccount.entity;
            if (!player) throw new Error("No player found");

            const selectedRock = tables.ActiveRock.get()?.value;
            const resourceEntity = resources[resource];

            if (!resourceEntity || !selectedRock) throw new Error("Resource not found");

            const value = BigInt(count * Number(RESOURCE_SCALE));

            await setTableValue(
              tables.MaxResourceCount,
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
            const selectedRock = tables.SelectedRock.get()?.value;
            const resourceEntity = resources[resource];
            if (!resourceEntity || !selectedRock) throw new Error("Resource not found");

            const value = BigInt(count * Number(RESOURCE_SCALE));

            await setTableValue(
              tables.ResourceCount,
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
            const player = playerAccount.entity;
            if (!player) throw new Error("No player found");

            const colonyShipCap = tables.MaxColonySlots.get(player)?.value ?? 0n;
            await setTableValue(
              tables.MaxColonySlots,
              { playerEntity: player as Hex },
              { value: colonyShipCap + BigInt(count) }
            );
            notify("success", `Colony Ship Capacity increased by ${count}`);
          },
        },
        conquerAsteroid: {
          params: [{ name: "baseType", type: "dropdown", dropdownOptions: ["MainBase", "WormholeBase"] }],
          function: async (baseType: string) => {
            const selectedRock = tables.SelectedRock.get()?.value;
            if (!selectedRock) {
              notify("error", `No rock selected`);
              throw new Error("No asteroid found");
            }
            notify("info", `Conquering ${entityToRockName(selectedRock)}`);
            const staticData = tables.Asteroid.get(selectedRock)?.__staticData;
            if (!staticData) {
              await createFleet([{ unit: EntityType.LightningCraft, count: 1 }], []);
              notify("error", "Asteroid not initialized. Send fleet to initialize it");
              throw new Error("Asteroid not initialized");
            }
            const entity = baseType == "MainBase" ? EntityType.MainBase : EntityType.WormholeBase;
            const player = playerAccount.entity;
            const colonyShipCap = tables.MaxColonySlots.get(player)?.value ?? 0n;
            await setTableValue(tables.MaxColonySlots, { playerEntity: player as Hex }, { value: colonyShipCap + 1n });
            await setTableValue(tables.OwnedBy, { entity: selectedRock as Hex }, { value: player });
            const position = tables.Position.get(entity);
            if (!position) throw new Error("No main base found");
            await buildBuildingCall(BuildingEnumLookup[entity], { ...position, parentEntity: selectedRock });
            notify("success", `Asteroid ${entityToRockName(selectedRock)} conquered`);
          },
        },
        conquerAllPrimaryAsteroids: {
          params: [],
          function: async () => {
            const asteroids = tables.Asteroid.getAllWith({ spawnsSecondary: true });
            for (const asteroid of asteroids) {
              const position = tables.Position.get(asteroid);
              if (!position) continue;
              await setTableValue(tables.OwnedBy, { entity: asteroid as Hex }, { value: playerAccount.entity });
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
            const selectedRock = tables.ActiveRock.get()?.value;
            const resourceEntity = resources[resource];
            const mapId = tables.Asteroid.get(selectedRock)?.mapId ?? 1;

            if (!resourceEntity || !selectedRock) throw new Error("Resource not found");

            await setTableValue(
              tables.P_Terrain,
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
        buildBuilding: {
          params: [{ name: "building", type: "dropdown", dropdownOptions: Object.keys(buildings) }],
          function: async (building: string) => {
            const selectedRock = tables.ActiveRock.get()?.value;
            const buildingEntity = buildings[building];
            if (!buildingEntity || !selectedRock) throw new Error("Building not found");

            await provideBuildingRequiredResources(selectedRock, buildingEntity, 1n);
            await buildBuildingCall(BuildingEnumLookup[buildingEntity], findTilePosition(selectedRock, buildingEntity));
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
            const selectedBuilding = tables.SelectedBuilding.get()?.value;

            if (!selectedBuilding) {
              notify("error", "No building selected");
              throw new Error("No building selected");
            }
            await upgradeBuilding(selectedBuilding, level == "max" ? "max" : Number(level));
          },
        },
        clearCooldown: {
          params: [],
          function: async () => {
            const selectedBuilding = tables.SelectedBuilding.get()?.value;
            if (!selectedBuilding) {
              notify("error", "No building selected");
              throw new Error("No building selected");
            }
            const time = tables.Time.get()?.value ?? 0n;
            await setTableValue(
              tables.CooldownEnd,
              { entity: selectedBuilding as Hex },
              {
                value: time + 10n,
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
            const player = playerAccount.entity;
            if (!player) throw new Error("No player found");
            const selectedFleet = tables.SelectedFleet.get()?.value;

            const unitEntity = units[unit];

            if (!unitEntity || !selectedFleet) throw new Error("Resource not found");

            await setTableValue(
              tables.UnitCount,
              { entity: selectedFleet as Hex, unit: unitEntity as Hex },
              {
                value: BigInt(count),
              }
            );

            await setTableValue(
              tables.IsFleetEmpty,
              { entity: selectedFleet as Hex },
              {
                value: false,
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
            const player = playerAccount.entity;
            if (!player) throw new Error("No player found");
            const selectedFleet = tables.SelectedFleet.get()?.value;

            const resourceEntity = resources[resource];

            if (!resourceEntity || !selectedFleet) throw new Error("Resource not found");

            const value = BigInt(count * Number(RESOURCE_SCALE));

            await setTableValue(
              tables.ResourceCount,
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
            const timestamp = (tables.Time.get()?.value ?? 0n) + BigInt(value);
            const selectedFleet = tables.SelectedFleet.get()?.value;
            if (!selectedFleet) {
              notify("error", "No fleet selected");
              throw new Error("No fleet selected");
            }
            await setTableValue(
              tables.CooldownEnd,
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
            await setTableValue(
              tables.P_AllianceConfig,
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
