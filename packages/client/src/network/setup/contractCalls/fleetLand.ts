import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
import { Hex } from "viem";
import { ampli } from "src/ampli";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const landFleet = async (mud: MUD, fleet: Entity, asteroidEntity: Entity) => {
  await execute(
    {
      mud,
      functionName: "Pri_11__landFleet",
      systemId: getSystemId("FleetLandSystem"),
      args: [fleet as Hex, asteroidEntity as Hex],
      withSession: true,
    },
    {
      id: "landFleet" as Entity,
      type: TransactionQueueType.LandFleet,
    },
    (receipt) => {
      makeObjectiveClaimable(mud.playerAccount.entity, EObjectives.LandFleet);

      ampli.systemFleetLandSystemPrimodiumLandFleet({
        fleets: [fleet as Hex],
        ...parseReceipt(receipt),
      });
    }
  );
};
