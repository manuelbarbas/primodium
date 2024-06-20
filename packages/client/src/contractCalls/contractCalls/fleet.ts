import { Core, AccountClient, TxQueueOptions, Coord, ExecuteFunctions } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { EFleetStance, EObjectives } from "contracts/config/enums";
import { makeObjectiveClaimable } from "@/util/objectives/makeObjectiveClaimable";
import { ampli } from "@/ampli";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createFleetCalls = (core: Core, { playerAccount }: AccountClient, { execute }: ExecuteFunctions) => {
  const { tables, utils } = core;
  const createFleet = async (
    asteroidEntity: Entity,
    deltas: Map<Entity, bigint>,
    options?: Partial<TxQueueOptions>
  ) => {
    await execute({
      functionName: "Pri_11__createFleet",

      args: [asteroidEntity, utils.toUnitCountArray(deltas), utils.toTransportableResourceArray(deltas)],
      withSession: true,
      txQueueOptions: {
        id: "TRANSFER",
        ...options,
      },
      onComplete: (receipt) => {
        makeObjectiveClaimable(core, playerAccount.entity, EObjectives.CreateFleet);

        ampli.systemFleetCreateSystemPrimodiumCreateFleet({
          spaceRock: asteroidEntity,
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const abandonFleet = async (fleet: Entity) => {
    await execute({
      functionName: "Pri_11__abandonFleet",

      args: [fleet],
      withSession: true,
      txQueueOptions: {
        id: "abandonFleet",
      },
      onComplete: (receipt) => {
        ampli.systemFleetClearSystemPrimodiumAbandonFleet({
          fleets: [fleet],
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const clearFleet = async (fleet: Entity) => {
    await execute({
      functionName: "Pri_11__clearFleet",

      args: [fleet],
      withSession: true,
      txQueueOptions: {
        id: `clear-${fleet}`,
      },
      onComplete: (receipt) => {
        tables.SelectedFleet.remove();

        ampli.systemFleetClearSystemPrimodiumClearFleet({
          fleets: [fleet],
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const clearFleetUnitsResources = async (fleet: Entity, content: Map<Entity, bigint>) => {
    const unitCounts = utils.toUnitCountArray(content);
    const resourceCounts = utils.toTransportableResourceArray(content);
    const totalUnits = unitCounts.reduce((acc, cur) => acc + cur, 0n);
    const totalResources = resourceCounts.reduce((acc, cur) => acc + cur, 0n);

    if (totalUnits == 0n && totalResources == 0n) return;

    if (totalUnits == 0n) {
      return await execute({
        functionName: "Pri_11__clearResources",

        args: [fleet, resourceCounts],
        withSession: true,
        txQueueOptions: {
          id: `clear-${fleet}`,
        },
        onComplete: (receipt) => {
          ampli.systemFleetClearSystemPrimodiumClearResources({
            fleets: [fleet],
            ...parseReceipt(receipt),
          });
        },
      });
    }
    if (totalResources == 0n) {
      return await execute({
        functionName: "Pri_11__clearUnits",

        args: [fleet, unitCounts],
        withSession: true,
        txQueueOptions: {
          id: `clear-${fleet}`,
        },
        onComplete: (receipt) => {
          ampli.systemFleetClearSystemPrimodiumClearUnits({
            fleets: [fleet],
            ...parseReceipt(receipt),
          });
        },
      });
    } else {
      await execute({
        functionName: "Pri_11__clearUnitsAndResourcesFromFleet",

        args: [fleet, unitCounts, resourceCounts],
        withSession: true,
        txQueueOptions: {
          id: `clear-${fleet}`,
        },
        onComplete: (receipt) => {
          ampli.systemFleetClearSystemPrimodiumClearUnitsAndResourcesFromFleet({
            fleets: [fleet],
            ...parseReceipt(receipt),
          });
        },
      });
    }
  };
  const landFleet = async (fleet: Entity, asteroidEntity: Entity) => {
    await execute({
      functionName: "Pri_11__landFleet",

      args: [fleet, asteroidEntity],
      withSession: true,
      txQueueOptions: {
        id: "landFleet",
      },
      onComplete: (receipt) => {
        makeObjectiveClaimable(core, playerAccount.entity, EObjectives.LandFleet);

        ampli.systemFleetLandSystemPrimodiumLandFleet({
          fleets: [fleet],
          ...parseReceipt(receipt),
        });
      },
    });
  };
  const mergeFleets = async (fleets: Entity[]) => {
    await execute({
      functionName: "Pri_11__mergeFleets",

      args: [fleets],
      withSession: true,
      txQueueOptions: {
        id: `merge-${fleets.map((f) => f).join("-")}`,
      },
      onComplete: (receipt) => {
        ampli.systemFleetMergeSystemPrimodiumMergeFleets({
          fleets,
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const recallFleet = async (fleet: Entity) => {
    await execute({
      functionName: "Pri_11__recallFleet",

      args: [fleet],
      withSession: true,
      txQueueOptions: {
        id: `recall-${fleet}`,
      },
      onComplete: (receipt) => {
        ampli.systemFleetRecallSystemPrimodiumRecallFleet({
          fleets: [fleet],
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const sendFleet = async (fleet: Entity, spaceRock: Entity) => {
    const activeAsteroid = tables.ActiveRock.get()?.value;
    await execute({
      functionName: "Pri_11__sendFleet",

      args: [fleet, spaceRock],
      withSession: true,
      txQueueOptions: {
        id: `send-${fleet}-${spaceRock}`,
      },
      onComplete: (receipt) => {
        activeAsteroid && makeObjectiveClaimable(core, playerAccount.entity, EObjectives.SendFleet);

        ampli.systemFleetSendSystemPrimodiumSendFleet({
          fleets: [fleet],
          spaceRock: spaceRock,
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const sendFleetPosition = async (fleet: Entity, position: Coord) => {
    const activeAsteroid = tables.ActiveRock.get()?.value;
    await execute({
      functionName: "Pri_11__sendFleet",

      args: [fleet, { ...position, parentEntity: fleet }],
      withSession: true,
      txQueueOptions: {
        id: `send-${fleet}`,
      },
      onComplete: (receipt) => {
        activeAsteroid && makeObjectiveClaimable(core, playerAccount.entity, EObjectives.SendFleet);

        ampli.systemFleetSendSystemPrimodiumSendFleet({
          fleets: [fleet],
          spaceRock: "",
          spaceRockCoord: [position.x, position.y],
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const setFleetStance = async (fleet: Entity, stance: EFleetStance, target: Entity) => {
    const objective =
      stance == EFleetStance.Defend
        ? EObjectives.DefendWithFleet
        : stance == EFleetStance.Block
        ? EObjectives.BlockWithFleet
        : undefined;
    await execute({
      functionName: "Pri_11__setFleetStance",

      args: [fleet, stance, target],
      withSession: true,
      txQueueOptions: {
        id: "FleetStance",
      },
      onComplete: (receipt) => {
        !!objective && makeObjectiveClaimable(core, playerAccount.entity, objective);

        ampli.systemFleetStanceSystemPrimodiumSetFleetStance({
          fleets: [fleet],
          fleetStance: stance,
          spaceRock: target,
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const clearFleetStance = async (fleet: Entity) => {
    await execute({
      functionName: "Pri_11__clearFleetStance",

      args: [fleet],
      withSession: true,
      txQueueOptions: {
        id: "FleetStance",
      },
      onComplete: (receipt) => {
        ampli.systemFleetStanceSystemPrimodiumClearFleetStance({
          fleets: [fleet],
          ...parseReceipt(receipt),
        });
      },
    });
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
