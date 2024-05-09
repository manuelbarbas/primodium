import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FaExchangeAlt } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { useMud } from "src/hooks";
import { usePlayerOwner } from "src/hooks/usePlayerOwner";

export const TransferSwap: React.FC<{
  from: Entity | null;
  to: Entity | null | "newFleet";
  onClick: (newFrom: Entity | null, newTo: Entity | null) => void;
}> = ({ from, to, onClick }) => {
  const toEntity = to === "newFleet" || to === undefined ? singletonEntity : to;
  const toOwner = usePlayerOwner(toEntity ?? undefined);
  const playerEntity = useMud().playerAccount.entity;
  const disabled = (!from && !to) || to === "newFleet" || (toOwner && toOwner !== playerEntity);
  return (
    <Button
      variant="primary"
      size="sm"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onClick(to, from);
      }}
      tooltip="Switch to and from"
      tooltipDirection="top"
    >
      <FaExchangeAlt /> Switch
    </Button>
  );
};
