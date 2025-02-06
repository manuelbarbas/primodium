import { Entity } from "@primodiumxyz/reactive-tables";
import { PushButton } from "@/components/core/PushButton";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useTransfer } from "@/hooks/providers/TransferProvider";
import { useContractCalls } from "@/hooks/useContractCalls";

export const TransferConfirm = () => {
  const { left, right, setRight, deltas, setDeltas, errors } = useTransfer();
  const { createFleet, transfer } = useContractCalls();
  const disabled = !!errors["left"] || !!errors["right"] || deltas.size === 0;
  const newFleet = right === "newFleet";

  const handleSubmit = () => {
    if (!left || !right) return;
    if (newFleet) {
      createFleet(left, deltas);
      setRight(undefined);
    } else transfer(left, right, deltas);
    setDeltas(new Map());
  };

  return (
    <TransactionQueueMask queueItemId={"TRANSFER" as Entity} className="w-18">
      <PushButton variant="primary" size="md" className="w-18" disabled={disabled} onClick={handleSubmit}>
        {newFleet ? "Create" : "Transfer"}
      </PushButton>
    </TransactionQueueMask>
  );
};
