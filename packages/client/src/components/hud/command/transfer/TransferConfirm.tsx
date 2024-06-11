import { PushButton } from "@/components/core/PushButton";
import { useMud } from "@/react/hooks";
import { useTransfer } from "@/react/hooks/providers/TransferProvider";
import { createFleet } from "@/network/setup/contractCalls/createFleet";
import { transfer } from "@/network/setup/contractCalls/transfer";
import { Entity } from "@latticexyz/recs";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";

export const TransferConfirm = () => {
  const { left, right, setRight, deltas, setDeltas, errors } = useTransfer();
  const mud = useMud();
  const disabled = !!errors["left"] || !!errors["right"] || deltas.size === 0;
  const newFleet = right === "newFleet";

  const handleSubmit = () => {
    if (!left || !right) return;
    if (newFleet) {
      createFleet(mud, left, deltas);
      setRight(undefined);
    } else transfer(mud, left, right, deltas);
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
