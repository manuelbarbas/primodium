import { Entity } from "@latticexyz/recs";

import { Account } from "src/network/components/clientComponents";

import { useMemo } from "react";

import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FaCheck } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components as comps } from "src/network/components";
import { claimObjective } from "src/network/setup/contractCalls/claimObjective";

import { AudioKeys } from "src/game/lib/constants/assets/audio";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { getCanClaimObjective } from "src/util/objectives/objectiveRequirements";
import { Hex } from "viem";

export const ClaimObjectiveButton: React.FC<{
  objectiveEntity: Entity;
}> = ({ objectiveEntity }) => {
  const mud = useMud();
  const selectedRock = comps.ActiveRock.use()?.value ?? singletonEntity;

  const player = Account.use()?.value ?? singletonEntity;
  const hasCompletedObjective =
    comps.CompletedObjective.useWithKeys({ objective: objectiveEntity as Hex, entity: player as Hex })?.value ?? false;

  const canClaim = useMemo(() => {
    return getCanClaimObjective(mud.playerAccount.entity, selectedRock, objectiveEntity);
  }, [selectedRock, objectiveEntity]);

  if (!hasCompletedObjective)
    return (
      <TransactionQueueMask
        className="w-full mt-2"
        queueItemId={hashEntities(TransactionQueueType.ClaimObjective, objectiveEntity)}
      >
        <Button
          disabled={!canClaim}
          className={`btn-sm btn-secondary border-accent w-full`}
          clickSound={AudioKeys.Complete2}
          onClick={() => claimObjective(mud, selectedRock, objectiveEntity)}
        >
          Claim
        </Button>
      </TransactionQueueMask>
    );

  return (
    <div className="flex items-center justify-end">
      <FaCheck className=" text-success mr-2" />
    </div>
  );
};
