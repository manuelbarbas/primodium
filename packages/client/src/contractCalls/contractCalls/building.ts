import { Coord } from "engine/types";
import { EBuilding } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";
import {
  Core,
  getSystemId,
  BuildingEntityLookup,
  getEntityTypeName,
  TxQueueOptions,
  bigintToNumber,
} from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createBuildingCalls = ({ utils, tables }: Core, { execute }: ExecuteFunctions) => {
  const buildBuilding = async (
    building: EBuilding,
    coord: Coord & { parentEntity?: Entity },
    options?: Partial<TxQueueOptions>
  ) => {
    const activeAsteroid = tables.ActiveRock.get()?.value;
    if (!activeAsteroid) return;

    const position = { ...coord, parentEntity: coord.parentEntity ?? activeAsteroid };

    await execute(
      {
        functionName: "Pri_11__build",
        systemId: getSystemId("BuildSystem"),
        args: [building, position],
        withSession: true,
        options: { gas: 7000000n },
      },
      {
        id: `build-${building}-${coord.x}-${coord.y}`,
        metadata: {
          coord: utils.getBuildingBottomLeft(coord, BuildingEntityLookup[building]),
          buildingType: BuildingEntityLookup[building],
        },
        type: "build",
        ...options,
      },
      (receipt) => {
        ampli.systemBuild({
          asteroidCoord: activeAsteroid,
          buildingType: getEntityTypeName(BuildingEntityLookup[building]),
          coord: [coord.x, coord.y],
          currLevel: 0,
          ...parseReceipt(receipt),
        });
      }
    );
  };
  const moveBuilding = async (building: Entity, coord: Coord, onComplete?: () => void) => {
    // todo: find a cleaner way to extract this value in all web3 functions
    const activeAsteroid = tables.ActiveRock.get()?.value;
    if (!activeAsteroid) return;

    const prevPosition = tables.Position.get(building);
    const position = { ...coord, parentEntity: activeAsteroid };
    const buildingType = tables.BuildingType.get(building)?.value;

    if (!prevPosition || !buildingType) return;

    await execute(
      {
        functionName: "Pri_11__moveBuilding",
        systemId: getSystemId("MoveBuildingSystem"),
        args: [building, position],
        withSession: true,
        options: { gas: 3_000_000n },
      },
      {
        id: `move-${building}-${coord.x}-${coord.y}`,
        metadata: {
          buildingType,
          coord: utils.getBuildingTopLeft(coord, buildingType as Entity),
        },
      },
      // TODO: we don't need to use coord here any longer
      (receipt) => {
        onComplete?.();
        const buildingType = tables.BuildingType.get(building)?.value;
        const currLevel = tables.Level.get(building)?.value || 0;

        ampli.systemMoveBuilding({
          asteroidCoord: activeAsteroid,
          buildingType: getEntityTypeName(buildingType as Entity),
          coord: [prevPosition.x, prevPosition.y],
          endCoord: [position.x, position.y],
          currLevel: bigintToNumber(currLevel),
          ...parseReceipt(receipt),
        });
      }
    );
  };

  async function demolishBuilding(building: Entity, onComplete?: () => void) {
    const position = tables.Position.get(building);

    if (!position) return;

    await execute(
      {
        functionName: "Pri_11__destroy",
        systemId: getSystemId("DestroySystem"),
        args: [building],
        withSession: true,
      },
      {
        id: `demolish-${building}`,
      },
      // TODO: we don't need to use coord here any longer
      (receipt) => {
        onComplete?.();
        const buildingType = tables.BuildingType.get(building)?.value;
        const currLevel = tables.Level.get(building)?.value || 0;

        ampli.systemDestroy({
          asteroidCoord: position.parentEntity,
          buildingType: getEntityTypeName(buildingType as Entity),
          coord: [position.x, position.y],
          currLevel: bigintToNumber(currLevel),
          ...parseReceipt(receipt),
        });
      }
    );
  }

  async function toggleBuilding(building: Entity) {
    const position = tables.Position.get(building);
    const active = tables.IsActive.get(building);

    if (!position || !active) return;

    await execute(
      {
        functionName: "Pri_11__toggleBuilding",
        systemId: getSystemId("ToggleBuildingSystem"),
        args: [building],
        withSession: true,
      },
      {
        id: `toggle-${building}`,
      },
      (receipt) => {
        const buildingType = tables.BuildingType.get(building)?.value;
        const currLevel = tables.Level.get(building)?.value || 0;

        ampli.systemToggleBuilding({
          asteroidCoord: position.parentEntity,
          buildingType: getEntityTypeName(buildingType as Entity),
          buildingActiveFrom: active.value,
          coord: [position.x, position.y],
          currLevel: bigintToNumber(currLevel),
          ...parseReceipt(receipt),
        });
      }
    );
  }

  return {
    buildBuilding,
    moveBuilding,
    demolishBuilding,
    toggleBuilding,
  };
};
