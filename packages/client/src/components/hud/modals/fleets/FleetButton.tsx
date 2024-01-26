import { Entity } from "@latticexyz/recs";
import { Navigator } from "src/components/core/Navigator";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { getFleetStats } from "src/util/fleet";
import { entityToRockName } from "src/util/name";
import { formatResourceCount, formatTime } from "src/util/number";

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
  const fleetData = components.FleetMovement.get(fleetEntity);
  const timeRemaining = (fleetData?.arrivalTime ?? 0n) - (components.Time.use()?.value ?? 0n);
  if (!fleetData) return null;
  const destinationLocation = components.Position.get(fleetData.destination as Entity);

  return (
    <Navigator.NavButton
      className="btn-base-100 border border-secondary btn-sm flex flex-row p-2 text-xs"
      to={`manage-fleet-${fleetEntity}`}
    >
      <FleetStats fleetEntity={fleetEntity} />
      {timeRemaining > 0 && <p className="animate-pulse opacity-80">LANDING IN {formatTime(Number(timeRemaining))} </p>}
      {destinationLocation && timeRemaining <= 0 && (
        <p className="animate-pulse opacity-80 text-xs">
          ORBITING [{destinationLocation.x}, {destinationLocation.y}]
        </p>
      )}
    </Navigator.NavButton>
  );
};

const FleetStats: React.FC<{ fleetEntity: Entity }> = ({ fleetEntity }) => {
  const name = entityToRockName(fleetEntity);
  const stats = getFleetStats(fleetEntity);

  return (
    <div className="flex flex-col gap-1">
      {name}
      <div className="flex texs-xs uppercase">
        {stats.attack.toLocaleString()}|{stats.defense.toLocaleString()}|
        {formatResourceCount(EntityType.Iron, stats.cargo)}|{stats.speed.toLocaleString()}|{stats.hp.toLocaleString()}
      </div>
    </div>
  );
};
