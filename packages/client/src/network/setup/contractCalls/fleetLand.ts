import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
import { Hex } from "viem";

export const landFleet = async (mud: MUD, fleet: Entity, asteroidEntity: Entity) => {
  await execute(
    {
      mud,
      functionName: "Primodium__landFleet",
      systemId: getSystemId("FleetLandSystem"),
      args: [fleet as Hex, asteroidEntity as Hex],
      withSession: true,
    },
    {
      id: "landFleet" as Entity,
      type: TransactionQueueType.LandFleet,
    },
    () => makeObjectiveClaimable(mud.playerAccount.entity, EObjectives.LandFleet)
  );
};
