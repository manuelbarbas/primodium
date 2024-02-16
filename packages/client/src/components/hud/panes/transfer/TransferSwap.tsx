import { Entity } from "@latticexyz/recs";
import { FaExchangeAlt } from "react-icons/fa";
import { Button } from "src/components/core/Button";

export const TransferSwap: React.FC<{
  from: Entity | undefined;
  to: Entity | undefined | "newFleet";
  onClick: (newFrom: Entity | undefined, newTo: Entity | undefined) => void;
}> = ({ from, to, onClick }) => {
  const disabled = (!from && !to) || to === "newFleet";
  return (
    <Button
      className="btn-primary btn-xs"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onClick(to, from);
      }}
    >
      <FaExchangeAlt />
    </Button>
  );
};
