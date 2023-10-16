import { EntityID } from "@latticexyz/recs";
import { useCallback } from "react";
import { SecondaryCard } from "src/components/core/Card";
import { useFleetMoves } from "src/hooks/useFleetMoves";
import { Hangar, HomeAsteroid } from "src/network/components/clientComponents";
import { EntityType } from "src/util/constants";
import { UnitLabel } from "./UnitLabel";

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
        <UnitLabel name={"Fleet Moves"} count={fleetMoves ?? 0} resourceId={EntityType.FleetMoves} />
      </SecondaryCard>
      <SecondaryCard className="grid grid-cols-1 gap-1">
        <UnitLabel
          name={"Minutemen Marine"}
          count={getUnitCount(EntityType.MinutemanMarine)}
          resourceId={EntityType.MinutemanMarine}
        />
        <UnitLabel
          name={"Trident Marine"}
          count={getUnitCount(EntityType.TridentMarine)}
          resourceId={EntityType.TridentMarine}
        />
        <UnitLabel
          name={"Anvil Light Drone"}
          count={getUnitCount(EntityType.AnvilLightDrone)}
          resourceId={EntityType.AnvilLightDrone}
        />
        <UnitLabel
          name={"Hammer Drone"}
          count={getUnitCount(EntityType.HammerLightDrone)}
          resourceId={EntityType.HammerLightDrone}
        />
        <UnitLabel
          name={"Stinger Drone"}
          count={getUnitCount(EntityType.StingerDrone)}
          resourceId={EntityType.StingerDrone}
        />
        <UnitLabel
          name={"Aegis Drone"}
          count={getUnitCount(EntityType.AegisDrone)}
          resourceId={EntityType.AegisDrone}
        />
        <UnitLabel
          name={"Mining Vessel"}
          count={getUnitCount(EntityType.MiningVessel)}
          resourceId={EntityType.MiningVessel}
        />
      </SecondaryCard>
    </>
  );
};
