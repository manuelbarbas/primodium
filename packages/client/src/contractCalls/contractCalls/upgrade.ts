import { Entity } from "@primodiumxyz/reactive-tables";
import { EObjectives, EUnit } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
import {
  Core,
  AccountClient,
  TxQueueOptions,
  getEntityTypeName,
  getSystemId,
  bigintToNumber,
  UnitEntityLookup,
} from "@primodiumxyz/core";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createUpgrade = (
  { tables, utils }: Core,
  { playerAccount }: AccountClient,
  { execute }: ExecuteFunctions
) => {
  const upgradeUnit = async (spaceRock: Entity, unit: EUnit) => {
    await execute(
      {
        functionName: "Pri_11__upgradeUnit",
        systemId: getSystemId("UpgradeUnitSystem"),
        args: [spaceRock, unit],
        withSession: true,
      },
      {
        id: `upgrade-${UnitEntityLookup[unit]}`,
      },
      (receipt) => {
        makeObjectiveClaimable(playerAccount.entity, EObjectives.UpgradeUnit);
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
      }
    );
  };

  const upgradeRange = async (asteroid: Entity) => {
    await execute(
      {
        functionName: "Pri_11__upgradeRange",
        systemId: getSystemId("UpgradeRangeSystem"),
        args: [asteroid],
        withSession: true,
      },
      {
        id: `upgrade-${playerAccount.entity}`,
      },
      (receipt) => {
        const level = tables.Level.get(asteroid)?.value ?? 1n;
        const bounds = utils.getAsteroidBounds(asteroid);

        ampli.systemUpgradeRange({
          asteroidCoord: asteroid,
          currLevel: bigintToNumber(level),
          currBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const upgradeBuilding = async (building: Entity, options?: Partial<TxQueueOptions>) => {
    const position = tables.Position.get(building);
    if (!position) return;

    await execute(
      {
        functionName: "Pri_11__upgradeBuilding",
        systemId: getSystemId("UpgradeBuildingSystem"),
        args: [building],
        withSession: true,
        options: { gas: 2_500_000n },
      },
      {
        id: `upgrade-${building}`,
        ...options,
      },
      (receipt) => {
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
      }
    );
  };

  return {
    upgradeUnit,
    upgradeRange,
    upgradeBuilding,
  };
};
