import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FaExchangeAlt } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { useMud } from "src/hooks";
import { usePlayerOwner } from "src/hooks/usePlayerOwner";

export const TransferSwap: React.FC<{
  from: Entity | undefined;
  to: Entity | undefined | "newFleet";
  onClick: (newFrom: Entity | undefined, newTo: Entity | undefined) => void;
}> = ({ from, to, onClick }) => {
  const toEntity = to === "newFleet" || to === undefined ? singletonEntity : to;
  const toOwner = usePlayerOwner(toEntity);
  const playerEntity = useMud().playerAccount.entity;
  const disabled = (!from && !to) || to === "newFleet" || (toOwner && toOwner !== playerEntity);
  return (
    <Button
      className="btn-primary btn-sm"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onClick(to, from);
      }}
      tooltip="Swap to/from"
      tooltipDirection="top"
    >
      <FaExchangeAlt />
    </Button>
  );
};
