import { Entity } from "@latticexyz/recs";
import { EFleetStance, EObjectives } from "contracts/config/enums";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
import { Hex } from "viem";
import { ampli } from "src/ampli";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const setFleetStance = async (mud: MUD, fleet: Entity, stance: EFleetStance, target: Entity) => {
  const objective =
    stance == EFleetStance.Defend
      ? EObjectives.DefendWithFleet
      : stance == EFleetStance.Block
      ? EObjectives.BlockWithFleet
      : undefined;
  await execute(
    {
      mud,
      functionName: "Pri_11__setFleetStance",
      systemId: getSystemId("FleetStanceSystem"),
      args: [fleet as Hex, stance, target as Hex],
      withSession: true,
    },
    {
      id: "FleetStance" as Entity,
      type: TransactionQueueType.FleetStance,
    },
    (receipt) => {
      !!objective && makeObjectiveClaimable(mud.playerAccount.entity, objective);

      ampli.systemFleetStanceSystemPrimodiumSetFleetStance({
        fleets: [fleet as Hex],
        fleetStance: stance,
        spaceRock: target as Hex,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const clearFleetStance = async (mud: MUD, fleet: Entity) => {
  await execute(
    {
      mud,
      functionName: "Pri_11__clearFleetStance",
      systemId: getSystemId("FleetStanceSystem"),
      args: [fleet as Hex],
      withSession: true,
    },
    {
      id: "FleetStance" as Entity,
      type: TransactionQueueType.FleetStance,
    },
    (receipt) => {
      ampli.systemFleetStanceSystemPrimodiumClearFleetStance({
        fleets: [fleet as Hex],
        ...parseReceipt(receipt),
      });
    }
  );
};
