import { Core, AccountClient, getSystemId, TxQueueOptions, Coord } from "@primodiumxyz/core";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";
import { Entity } from "@primodiumxyz/reactive-tables";
import { EFleetStance, EObjectives } from "contracts/config/enums";
import { makeObjectiveClaimable } from "@/util/objectives/makeObjectiveClaimable";
import { ampli } from "src/ampli";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createFleetCalls = (
  { tables, utils }: Core,
  { playerAccount }: AccountClient,
  { execute }: ExecuteFunctions
) => {
  const createFleet = async (
    asteroidEntity: Entity,
    deltas: Map<Entity, bigint>,
    options?: Partial<TxQueueOptions>
  ) => {
    await execute(
      {
        functionName: "Pri_11__createFleet",
        systemId: getSystemId("FleetCreateSystem"),
        args: [asteroidEntity, utils.toUnitCountArray(deltas), utils.toTransportableResourceArray(deltas)],
        withSession: true,
      },
      {
        id: "TRANSFER",
        ...options,
      },
      (receipt) => {
        makeObjectiveClaimable(playerAccount.entity, EObjectives.CreateFleet);

        ampli.systemFleetCreateSystemPrimodiumCreateFleet({
          spaceRock: asteroidEntity,
          ...parseReceipt(receipt),
        });
      }
    );
  };
  const abandonFleet = async (fleet: Entity) => {
    await execute(
      {
        functionName: "Pri_11__abandonFleet",
        systemId: getSystemId("FleetClearSystem"),
        args: [fleet],
        withSession: true,
      },
      {
        id: "abandonFleet",
      },
      (receipt) => {
        ampli.systemFleetClearSystemPrimodiumAbandonFleet({
          fleets: [fleet],
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const clearFleet = async (fleet: Entity) => {
    await execute(
      {
        functionName: "Pri_11__clearFleet",
        systemId: getSystemId("FleetClearSystem"),
        args: [fleet],
        withSession: true,
      },
      {
        id: `clear-${fleet}`,
      },
      (receipt) => {
        tables.SelectedFleet.remove();

        ampli.systemFleetClearSystemPrimodiumClearFleet({
          fleets: [fleet],
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const clearFleetUnitsResources = async (fleet: Entity, content: Map<Entity, bigint>) => {
    const unitCounts = utils.toUnitCountArray(content);
    const resourceCounts = utils.toTransportableResourceArray(content);
    const totalUnits = unitCounts.reduce((acc, cur) => acc + cur, 0n);
    const totalResources = resourceCounts.reduce((acc, cur) => acc + cur, 0n);

    if (totalUnits == 0n && totalResources == 0n) return;

    if (totalUnits == 0n) {
      return await execute(
        {
          functionName: "Pri_11__clearResources",
          systemId: getSystemId("FleetClearSystem"),
          args: [fleet, resourceCounts],
          withSession: true,
        },
        {
          id: `clear-${fleet}`,
        },
        (receipt) => {
          ampli.systemFleetClearSystemPrimodiumClearResources({
            fleets: [fleet],
            ...parseReceipt(receipt),
          });
        }
      );
    }
    if (totalResources == 0n) {
      return await execute(
        {
          functionName: "Pri_11__clearUnits",
          systemId: getSystemId("FleetClearSystem"),
          args: [fleet, unitCounts],
          withSession: true,
        },
        {
          id: `clear-${fleet}`,
        },
        (receipt) => {
          ampli.systemFleetClearSystemPrimodiumClearUnits({
            fleets: [fleet],
            ...parseReceipt(receipt),
          });
        }
      );
    } else {
      await execute(
        {
          functionName: "Pri_11__clearUnitsAndResourcesFromFleet",
          systemId: getSystemId("FleetClearSystem"),
          args: [fleet, unitCounts, resourceCounts],
          withSession: true,
        },
        {
          id: `clear-${fleet}`,
        },
        (receipt) => {
          ampli.systemFleetClearSystemPrimodiumClearUnitsAndResourcesFromFleet({
            fleets: [fleet],
            ...parseReceipt(receipt),
          });
        }
      );
    }
  };
  const landFleet = async (fleet: Entity, asteroidEntity: Entity) => {
    await execute(
      {
        functionName: "Pri_11__landFleet",
        systemId: getSystemId("FleetLandSystem"),
        args: [fleet, asteroidEntity],
        withSession: true,
      },
      {
        id: "landFleet",
      },
      (receipt) => {
        makeObjectiveClaimable(playerAccount.entity, EObjectives.LandFleet);

        ampli.systemFleetLandSystemPrimodiumLandFleet({
          fleets: [fleet],
          ...parseReceipt(receipt),
        });
      }
    );
  };
  const mergeFleets = async (fleets: Entity[]) => {
    await execute(
      {
        functionName: "Pri_11__mergeFleets",
        systemId: getSystemId("FleetMergeSystem"),
        args: [fleets],
        withSession: true,
      },
      {
        id: `merge-${fleets.map((f) => f).join("-")}`,
      },
      (receipt) => {
        ampli.systemFleetMergeSystemPrimodiumMergeFleets({
          fleets,
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const recallFleet = async (fleet: Entity) => {
    await execute(
      {
        functionName: "Pri_11__recallFleet",
        systemId: getSystemId("FleetRecallSystem"),
        args: [fleet],
        withSession: true,
      },
      {
        id: `recall-${fleet}`,
      },
      (receipt) => {
        ampli.systemFleetRecallSystemPrimodiumRecallFleet({
          fleets: [fleet],
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const sendFleet = async (fleet: Entity, spaceRock: Entity) => {
    const activeAsteroid = tables.ActiveRock.get()?.value;
    await execute(
      {
        functionName: "Pri_11__sendFleet",
        systemId: getSystemId("FleetSendSystem"),
        args: [fleet, spaceRock],
        withSession: true,
      },
      {
        id: `send-${fleet}-${spaceRock}`,
      },
      (receipt) => {
        activeAsteroid && makeObjectiveClaimable(playerAccount.entity, EObjectives.SendFleet);

        ampli.systemFleetSendSystemPrimodiumSendFleet({
          fleets: [fleet],
          spaceRock: spaceRock,
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const sendFleetPosition = async (fleet: Entity, position: Coord) => {
    const activeAsteroid = tables.ActiveRock.get()?.value;
    await execute(
      {
        functionName: "Pri_11__sendFleet",
        systemId: getSystemId("FleetSendSystem"),
        args: [fleet, { ...position, parentEntity: fleet }],
        withSession: true,
      },
      {
        id: `send-${fleet}`,
      },
      (receipt) => {
        activeAsteroid && makeObjectiveClaimable(playerAccount.entity, EObjectives.SendFleet);

        ampli.systemFleetSendSystemPrimodiumSendFleet({
          fleets: [fleet],
          spaceRock: "",
          spaceRockCoord: [position.x, position.y],
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const setFleetStance = async (fleet: Entity, stance: EFleetStance, target: Entity) => {
    const objective =
      stance == EFleetStance.Defend
        ? EObjectives.DefendWithFleet
        : stance == EFleetStance.Block
        ? EObjectives.BlockWithFleet
        : undefined;
    await execute(
      {
        functionName: "Pri_11__setFleetStance",
        systemId: getSystemId("FleetStanceSystem"),
        args: [fleet, stance, target],
        withSession: true,
      },
      {
        id: "FleetStance",
      },
      (receipt) => {
        !!objective && makeObjectiveClaimable(playerAccount.entity, objective);

        ampli.systemFleetStanceSystemPrimodiumSetFleetStance({
          fleets: [fleet],
          fleetStance: stance,
          spaceRock: target,
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const clearFleetStance = async (fleet: Entity) => {
    await execute(
      {
        functionName: "Pri_11__clearFleetStance",
        systemId: getSystemId("FleetStanceSystem"),
        args: [fleet],
        withSession: true,
      },
      {
        id: "FleetStance",
      },
      (receipt) => {
        ampli.systemFleetStanceSystemPrimodiumClearFleetStance({
          fleets: [fleet],
          ...parseReceipt(receipt),
        });
      }
    );
  };

  return {
    createFleet,
    abandonFleet,
    clearFleet,
    clearFleetUnitsResources,
    landFleet,
    mergeFleets,
    recallFleet,
    sendFleet,
    sendFleetPosition,
    setFleetStance,
    clearFleetStance,
  };
};
