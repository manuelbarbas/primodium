import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { formatTime } from "src/util/number";
import { FleetEntityHeader } from "../../panes/fleets/FleetHeader";
import { useFleetNav } from "../../panes/fleets/Fleets";

export const LabeledValue: React.FC<{
  label: string;
  children?: React.ReactNode;
}> = ({ children = null, label }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-xs font-bold text-cyan-400">{label}</p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
};

export const FleetButton: React.FC<{
  fleetEntity: Entity;
  dontShowButton?: boolean;
}> = ({ fleetEntity }) => {
  const { NavButton } = useFleetNav();
  const fleetData = components.FleetMovement.get(fleetEntity);
  const timeRemaining = (fleetData?.arrivalTime ?? 0n) - (components.Time.use()?.value ?? 0n);
  if (!fleetData) return null;
  const destinationLocation = components.Position.get(fleetData.destination as Entity);

  return (
    <NavButton
      className="btn-base-100 border border-secondary btn-sm flex flex-row p-2 text-xs"
      goto="manageFleet"
      fleetEntity={fleetEntity}
    >
      <FleetEntityHeader entity={fleetEntity} />
      {timeRemaining > 0 && <p className="animate-pulse opacity-80">LANDING IN {formatTime(Number(timeRemaining))} </p>}
      {destinationLocation && timeRemaining <= 0 && (
        <p className="animate-pulse opacity-80 text-xs">
          ORBITING [{destinationLocation.x}, {destinationLocation.y}]
        </p>
      )}
    </NavButton>
  );
};
