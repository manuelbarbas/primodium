import { EntityID } from "@latticexyz/recs";
import { useCallback } from "react";
import { SecondaryCard } from "src/components/core/Card";
import { HomeAsteroid, Hangar } from "src/network/components/clientComponents";
import { BlockType } from "src/util/constants";
import { UnitLabel } from "./UnitLabel";
import { useFleetMoves } from "src/hooks/useFleetMoves";

export const AllUnitLabels = () => {
  const activeAsteroid = HomeAsteroid.use()?.value;
  const units = Hangar.use(activeAsteroid);
  const fleetMoves = useFleetMoves();

  const getUnitCount = useCallback(
    (unit: EntityID) => {
      if (!units) return 0;
      const index = units.units.indexOf(unit);
      if (index === -1) return 0;
      return units.counts[index];
    },
    [units]
  );

  return (
    <>
      <SecondaryCard className="grid grid-cols-1 gap-1">
        <UnitLabel
          name={"Fleet Moves"}
          count={fleetMoves ?? 0}
          resourceId={BlockType.FleetMoves}
        />
      </SecondaryCard>
      <SecondaryCard className="grid grid-cols-1 gap-1">
        <UnitLabel
          name={"Minutemen Marine"}
          count={getUnitCount(BlockType.MinutemenMarine)}
          resourceId={BlockType.MinutemenMarine}
        />
        <UnitLabel
          name={"Trident Marine"}
          count={getUnitCount(BlockType.TridentMarine)}
          resourceId={BlockType.TridentMarine}
        />
        <UnitLabel
          name={"Anvil Light Drone"}
          count={getUnitCount(BlockType.AnvilLightDrone)}
          resourceId={BlockType.AnvilLightDrone}
        />
        <UnitLabel
          name={"Hammer Drone"}
          count={getUnitCount(BlockType.HammerLightDrone)}
          resourceId={BlockType.HammerLightDrone}
        />
        <UnitLabel
          name={"Stinger Drone"}
          count={getUnitCount(BlockType.StingerDrone)}
          resourceId={BlockType.StingerDrone}
        />
        <UnitLabel
          name={"Aegis Drone"}
          count={getUnitCount(BlockType.AegisDrone)}
          resourceId={BlockType.AegisDrone}
        />
        <UnitLabel
          name={"Mining Vessel"}
          count={getUnitCount(BlockType.MiningVessel)}
          resourceId={BlockType.MiningVessel}
        />
      </SecondaryCard>
    </>
  );
};
