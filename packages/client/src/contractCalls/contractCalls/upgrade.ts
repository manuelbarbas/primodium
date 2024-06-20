import { Entity } from "@primodiumxyz/reactive-tables";
import { EObjectives, EUnit } from "contracts/config/enums";
import { ampli } from "@/ampli";
import { makeObjectiveClaimable } from "@/util/objectives/makeObjectiveClaimable";
import {
  Core,
  AccountClient,
  TxQueueOptions,
  getEntityTypeName,
  bigintToNumber,
  UnitEntityLookup,
  ExecuteFunctions,
} from "@primodiumxyz/core";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createUpgrade = (core: Core, { playerAccount }: AccountClient, { execute }: ExecuteFunctions) => {
  const { tables, utils } = core;
  const upgradeUnit = async (spaceRock: Entity, unit: EUnit) => {
    await execute({
      functionName: "Pri_11__upgradeUnit",

      args: [spaceRock, unit],
      withSession: true,
      txQueueOptions: {
        id: `upgrade-${UnitEntityLookup[unit]}`,
      },
      onComplete: (receipt) => {
        makeObjectiveClaimable(core, playerAccount.entity, EObjectives.UpgradeUnit);
        const unitLevel =
          tables.UnitLevel.getWithKeys({
            entity: playerAccount.entity,
            unit: UnitEntityLookup[unit],
          })?.value ?? 0n;

        ampli.systemUpgradeUnit({
          currLevel: bigintToNumber(unitLevel),
          unitName: getEntityTypeName(UnitEntityLookup[unit]),
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const upgradeRange = async (asteroid: Entity) => {
    await execute({
      functionName: "Pri_11__upgradeRange",

      args: [asteroid],
      withSession: true,
      txQueueOptions: {
        id: `upgrade-${playerAccount.entity}`,
      },
      onComplete: (receipt) => {
        const level = tables.Level.get(asteroid)?.value ?? 1n;
        const bounds = utils.getAsteroidBounds(asteroid);

        ampli.systemUpgradeRange({
          asteroidCoord: asteroid,
          currLevel: bigintToNumber(level),
          currBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const upgradeBuilding = async (building: Entity, options?: Partial<TxQueueOptions>) => {
    const position = tables.Position.get(building);
    if (!position) return;

    await execute({
      functionName: "Pri_11__upgradeBuilding",

      args: [building],
      withSession: true,
      options: { gas: 2_500_000n },
      txQueueOptions: {
        id: `upgrade-${building}`,
        ...options,
      },
      onComplete: (receipt) => {
        const building = tables.SelectedBuilding.get()?.value;
        const buildingType = tables.BuildingType.get(building)?.value;
        const currLevel = tables.Level.get(building)?.value || 0n;

        ampli.systemUpgrade({
          asteroidCoord: position.parentEntity!,
          buildingType: getEntityTypeName(buildingType as Entity),
          coord: [position.x, position.y],
          currLevel: bigintToNumber(currLevel),
          ...parseReceipt(receipt),
        });
      },
    });
  };

  return {
    upgradeUnit,
    upgradeRange,
    upgradeBuilding,
  };
};
