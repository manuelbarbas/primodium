import { defaultEntity, Entity } from "@primodiumxyz/reactive-tables";

import { useMemo } from "react";

import { FaCheck } from "react-icons/fa";
import { Button } from "@/components/core/Button";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";

import { getCanClaimObjective } from "@/util/objectives/objectiveRequirements";
import { Hex } from "viem";
import { useCore } from "@primodiumxyz/core/react";
import { useContractCalls } from "@/hooks/useContractCalls";

export const ClaimObjectiveButton: React.FC<{
  objectiveEntity: Entity;
}> = ({ objectiveEntity }) => {
  const core = useCore();
  const { claimObjective } = useContractCalls();
  const { tables } = core;
  const playerEntity = tables.Account.use()?.value ?? tables.Account.get()?.value;
  const selectedRock = tables.ActiveRock.use()?.value ?? defaultEntity;
  if (!playerEntity || !selectedRock) throw new Error("No player entity or selected entity");

  const hasCompletedObjective =
    tables.CompletedObjective.useWithKeys({ objective: objectiveEntity as Hex, entity: playerEntity as Hex })?.value ??
    false;

  const time = tables.Time.use()?.value;
  const canClaim = useMemo(() => {
    if (!playerEntity) return false;
    return getCanClaimObjective(core, playerEntity, selectedRock, objectiveEntity);
  }, [selectedRock, objectiveEntity, time, playerEntity]);

  if (!hasCompletedObjective)
    return (
      <TransactionQueueMask className="w-full mt-2" queueItemId={`claim-${objectiveEntity}`}>
        <Button
          disabled={!canClaim}
          className={`btn-sm btn-secondary border-accent w-full`}
          onClick={() => claimObjective(selectedRock, objectiveEntity)}
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
