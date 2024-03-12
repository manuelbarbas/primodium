import { Primodium } from "@game/api";
import { Scenes } from "@game/constants";
import { createBurnerAccount, transportObserver } from "@latticexyz/common";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Cheatcodes } from "@primodiumxyz/mud-game-tools";
import { EBuilding, EResource } from "contracts/config/enums";
import encodeBytes32 from "contracts/config/util/encodeBytes32";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { toast } from "react-toastify";
import { components } from "src/network/components";
import { getNetworkConfig } from "src/network/config/getNetworkConfig";
import { buildBuilding } from "src/network/setup/contractCalls/buildBuilding";
import { createFleet as callCreateFleet } from "src/network/setup/contractCalls/createFleet";
import { removeComponent, setComponentValue } from "src/network/setup/contractCalls/dev";
import { MUD } from "src/network/types";
import { encodeEntity, hashEntities, hashKeyEntity, toHex32 } from "src/util/encode";
import { Hex, createWalletClient, fallback, getContract, http, webSocket } from "viem";
import { generatePrivateKey } from "viem/accounts";
import {
  EntityType,
  PIRATE_KEY,
  RESOURCE_SCALE,
  ResourceEntityLookup,
  ResourceEnumLookup,
  ResourceStorages,
  UtilityStorages,
} from "./constants";
import { entityToRockName } from "./name";

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

export const setupCheatcodes = (mud: MUD, primodium: Primodium): Cheatcodes => {
  const provideResource = async (spaceRock: Entity, resource: Entity, value: bigint) => {
    const resourceIndex = ResourceEnumLookup[resource];
    const systemCalls: Promise<unknown>[] = [];
    const entity = encodeEntity(components.ProductionRate.metadata.keySchema, {
      entity: spaceRock as Hex,
      resource: resourceIndex,
    });
    if (components.P_IsUtility.get(resource)) {
      systemCalls.push(
        setComponentValue(mud, mud.components.ProductionRate, entity, {
          value,
        })
      );
    } else {
      const currentResourceCount = components.ResourceCount.get(entity)?.value ?? 0n;
      const newResourceCount = currentResourceCount + value;
      if (components.MaxResourceCount.get(entity)?.value ?? 0n < newResourceCount) {
        systemCalls.push(
          setComponentValue(mud, mud.components.MaxResourceCount, entity, {
            value: newResourceCount,
          })
        );
      }
      systemCalls.push(
        setComponentValue(mud, mud.components.ResourceCount, entity, {
          value: newResourceCount,
        })
      );
    }
    await Promise.all(systemCalls);
  };

  const provideUnit = async (spaceRock: Entity, unit: Entity, value: bigint) => {
    const rockUnitEntity = encodeEntity(components.UnitCount.metadata.keySchema, {
      unit: unit as Hex,
      entity: spaceRock as Hex,
    });
    const level = components.UnitLevel.get(rockUnitEntity)?.value ?? 1n;

    const unitRequiredResources = getTrainCost(unit, level, value);

    [...unitRequiredResources.entries()].map(([resource, count]) => provideResource(spaceRock, resource, count));
    await setComponentValue(mud, mud.components.UnitCount, rockUnitEntity, {
      value,
    });
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
          function: async () => {
            const player = mud.playerAccount.entity;
            if (!player) {
              throw new Error("No player found");
            }
            for (const resource of [...ResourceStorages]) {
              await setComponentValue(
                mud,
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
              await setComponentValue(
                mud,
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
              if (!player) {
                throw new Error("No player found");
              }

              await setComponentValue(
                mud,
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

              await setComponentValue(
                mud,
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

            toast.success("Beginner Tester Pack succeeded");
          },
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
            await setComponentValue(mud, mud.components.P_GameConfig, singletonEntity, {
              worldSpeed: BigInt(value),
            });
          },
        },
        stopGracePeriod: {
          params: [],
          function: async () => {
            toast.info("running cheatcode: Stop Grace Period");
            setComponentValue(mud, components.P_GracePeriod, singletonEntity, { spaceRock: 0n });
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
      title: "Asteroid Mgmnt",
      content: {
        setMainBaseLevel: {
          params: [
            { name: "level", type: "dropdown", dropdownOptions: ["1", "2", "3", "4", "5", "6", "7", "8"].reverse() },
          ],
          function: async (level: string) => {
            const selectedRock = mud.components.ActiveRock.get()?.value;
            const mainBase = mud.components.Home.get(selectedRock)?.value as Entity | undefined;
            if (!mainBase) throw new Error("No main base found");
            await setComponentValue(mud, mud.components.Level, mainBase, {
              value: BigInt(level),
            });
            toast.success("Main Base Level set to " + level);
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
            const resourceEntity = resources[resource.toLowerCase()];
            const mapId = components.Asteroid.get(selectedRock)?.mapId ?? 1;

            if (!resourceEntity || !selectedRock) throw new Error("Resource not found");

            await setComponentValue(
              mud,
              mud.components.P_Terrain,
              encodeEntity(components.P_Terrain.metadata.keySchema, { mapId, x, y }),
              {
                value: ResourceEnumLookup[resourceEntity],
              }
            );
            toast.success(`Terrain set to ${resource} at [${x}, ${y}]. Reload to see change.`);
          },
        },
        giveAsteroidResource: {
          params: [
            { name: "resource", type: "dropdown", dropdownOptions: Object.keys(resources) },
            { name: "count", type: "number" },
          ],
          function: async (resource: string, count: number) => {
            const player = mud.playerAccount.entity;
            if (!player) throw new Error("No player found");
            const selectedRock = mud.components.ActiveRock.get()?.value;

            const resourceEntity = resources[resource.toLowerCase()];

            if (!resourceEntity || !selectedRock) throw new Error("Resource not found");
            provideResource(selectedRock, resourceEntity, BigInt(count * Number(RESOURCE_SCALE)));
            toast.success(`${count} ${resource} given to asteroid`);
          },
        },

        giveAsteroidUnits: {
          params: [
            { name: "unit", type: "dropdown", dropdownOptions: Object.keys(units) },
            { name: "count", type: "number" },
          ],
          function: async (unit: string, count: number) => {
            const unitEntity = units[unit.toLowerCase().replace(/\s+/g, "")];

            if (!unitEntity) throw new Error("Unit not found");

            const rock = mud.components.ActiveRock.get()?.value;
            if (!rock) throw new Error("No asteroid found");
            provideUnit(rock, unitEntity, BigInt(count));
            toast.success(`${count} ${unit} given to asteroid`);
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
            await setComponentValue(mud, components.OwnedBy, selectedRock, { value: player });
            const position = components.Position.get(toHex32("MainBase") as Entity);
            if (!position) throw new Error("No main base found");
            await buildBuilding(mud, EBuilding.MainBase, { ...position, parent: selectedRock as Hex });
            toast.success(`Asteroid ${entityToRockName(selectedRock)} conquered`);
          },
        },
        setResourceStorage: {
          params: [
            { name: "resource", type: "dropdown", dropdownOptions: Object.keys(resources) },
            { name: "count", type: "number" },
          ],
          function: async (resource: string, count: number) => {
            const player = mud.playerAccount.entity;
            if (!player) throw new Error("No player found");

            const selectedRock = mud.components.ActiveRock.get()?.value;
            const resourceEntity = resources[resource.toLowerCase()];

            if (!resourceEntity || !selectedRock) throw new Error("Resource not found");

            const value = BigInt(count * Number(RESOURCE_SCALE));

            await setComponentValue(
              mud,
              mud.components.MaxResourceCount,
              encodeEntity(
                { entity: "bytes32", resource: "uint8" },
                { entity: selectedRock as Hex, resource: ResourceEnumLookup[resourceEntity] }
              ),
              {
                value,
              }
            );
            toast.success(`${count} ${resource} storage given to ${entityToRockName(selectedRock)}`);
          },
        },
        createPirateAsteroid: {
          params: [],
          function: async () => {
            const playerEntity = mud.playerAccount.entity;
            const asteroid = components.ActiveRock.get()?.value;
            const ownerEntity = hashKeyEntity(PIRATE_KEY, playerEntity);
            const asteroidEntity = hashEntities(ownerEntity);
            const homePromise = setComponentValue(mud, components.Home, ownerEntity, { value: asteroidEntity as Hex });
            const position = components.Position.get(asteroid);
            const coord = { x: (position?.x ?? 0) + 10, y: (position?.y ?? 0) + 10, parent: encodeBytes32("0") };

            await setComponentValue(mud, components.PirateAsteroid, asteroidEntity, {
              isDefeated: false,
              isPirateAsteroid: true,
              prototype: encodeBytes32("0"),
              playerEntity: playerEntity,
            });

            const positionPromise = setComponentValue(mud, components.Position, asteroidEntity, coord);
            const asteroidPromise = setComponentValue(mud, components.Asteroid, asteroidEntity, { isAsteroid: true });

            const reversePosEntity = encodeEntity(mud.components.ReversePosition.metadata.keySchema, {
              x: coord.x,
              y: coord.y,
            });
            const reversePositionPromise = setComponentValue(mud, components.ReversePosition, reversePosEntity, {
              entity: asteroidEntity as Hex,
            });
            const ownedByPromise = setComponentValue(mud, components.OwnedBy, asteroidEntity, { value: ownerEntity });

            await Promise.all([homePromise, positionPromise, reversePositionPromise, asteroidPromise, ownedByPromise]);

            await setComponentValue(mud, components.PirateAsteroid, asteroidEntity, {
              isDefeated: false,
            });
            toast.success("Pirate asteroid created");
            primodium.api(Scenes.Starmap).camera.pan(coord);
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

            const resourceEntity = resources[resource.toLowerCase()];

            if (!resourceEntity || !selectedFleet) throw new Error("Resource not found");

            const value = BigInt(count * Number(RESOURCE_SCALE));

            await setComponentValue(
              mud,
              mud.components.ResourceCount,
              encodeEntity(
                { entity: "bytes32", resource: "uint8" },
                { entity: selectedFleet as Hex, resource: ResourceEnumLookup[resourceEntity] }
              ),
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
            await setComponentValue(
              mud,
              mud.components.CooldownEnd,
              components.SelectedFleet.get()?.value ?? singletonEntity,
              {
                value: BigInt(timestamp),
              }
            );
          },
        },
        removeCooldown: {
          params: [],
          function: async () => {
            await removeComponent(
              mud,
              components.CooldownEnd,
              components.SelectedFleet.get()?.value ?? singletonEntity
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
            await setComponentValue(mud, mud.components.P_AllianceConfig, singletonEntity, {
              maxAllianceMembers: BigInt(value),
            });
          },
        },
      },
    },
  ];
};
