import { Entity } from "@latticexyz/recs";
import Transfer from "../Transfer";
import { useFleetNav } from "./Fleets";

// const SelectTransferEntity
const FleetTransfer = ({ from, to }: { from: Entity; to: Entity }) => {
  const { BackButton } = useFleetNav();

  return (
    <div className="w-full h-full flex flex-col">
      <Transfer from={from} to={to} />
      <BackButton className="self-start">Back</BackButton>
    </div>
  );
};

export default FleetTransfer;
