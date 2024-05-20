import { Entity } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { EObjectives } from "contracts/config/enums";
import { components } from "src/network/components";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
import { Hex } from "viem";
import { ampli } from "src/ampli";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const sendFleet = async (mud: MUD, fleet: Entity, spaceRock: Entity) => {
  const activeAsteroid = components.ActiveRock.get()?.value;
  await execute(
    {
      mud,
      functionName: "Pri_11__sendFleet",
      systemId: getSystemId("FleetSendSystem"),
      args: [fleet as Hex, spaceRock as Hex],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.SendFleet, fleet),
      type: TransactionQueueType.SendFleet,
    },
    (receipt) => {
      activeAsteroid && makeObjectiveClaimable(mud.playerAccount.entity, EObjectives.SendFleet);

      ampli.systemFleetSendSystemPrimodiumSendFleet({
        fleets: [fleet as Hex],
        spaceRock: spaceRock,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const sendFleetPosition = async (mud: MUD, fleet: Entity, position: Coord) => {
  const activeAsteroid = components.ActiveRock.get()?.value;
  await execute(
    {
      mud,
      functionName: "Pri_11__sendFleet",
      systemId: getSystemId("FleetSendSystem"),
      args: [fleet as Hex, { ...position, parentEntity: fleet as Hex }],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.SendFleet, fleet),
      type: TransactionQueueType.SendFleet,
    },
    (receipt) => {
      activeAsteroid && makeObjectiveClaimable(mud.playerAccount.entity, EObjectives.SendFleet);

      ampli.systemFleetSendSystemPrimodiumSendFleet({
        fleets: [fleet as Hex],
        spaceRock: "",
        spaceRockCoord: [position.x, position.y],
        ...parseReceipt(receipt),
      });
    }
  );
};
