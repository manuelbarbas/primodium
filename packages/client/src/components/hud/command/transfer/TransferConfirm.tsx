import { PushButton } from "@/components/core/PushButton";
import { useMud } from "@/hooks";
import { useTransfer } from "@/hooks/providers/TransferProvider";
import { createFleet } from "@/network/setup/contractCalls/createFleet";
import { transfer } from "@/network/setup/contractCalls/transfer";
import { Entity } from "@latticexyz/recs";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";

export const TransferConfirm = () => {
  const { left, right, setRight, deltas, setDeltas, errors } = useTransfer();
  const mud = useMud();
  console.log(deltas.size);
  const disabled = !!errors["left"] || !!errors["right"] || deltas.size === 0;

  const handleSubmit = () => {
    if (!left || !right) return;
    if (right === "newFleet") {
      createFleet(mud, left, deltas);
      setRight(undefined);
    } else transfer(mud, left, right, deltas);
    setDeltas(new Map());
  };

  return (
    <TransactionQueueMask queueItemId={"TRANSFER" as Entity} className="w-full">
      <PushButton variant="primary" size="md" className="w-full" disabled={disabled} onClick={handleSubmit}>
        Transfer
      </PushButton>
    </TransactionQueueMask>
  );
};
