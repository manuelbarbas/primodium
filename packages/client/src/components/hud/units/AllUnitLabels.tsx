import { Entity } from "@latticexyz/recs";
import { useCallback } from "react";
import { SecondaryCard } from "src/components/core/Card";
import { useFleetMoves } from "src/hooks/useFleetMoves";

import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { UnitLabel } from "./UnitLabel";

export const AllUnitLabels = () => {
  const { playerEntity } = useMud().network;
  const homeAsteroid = components.Home.use(playerEntity)?.asteroid as Entity;
  const units = components.Hangar.use(homeAsteroid);
  const fleetMoves = useFleetMoves();

  const getUnitCount = useCallback(
    (unit: Entity) => {
      if (!units) return 0n;
      const index = units.units.indexOf(unit);
      if (index === -1) return 0n;
      return units.counts[index];
    },
    [units]
  );

  return (
    <>
      <SecondaryCard className="grid grid-cols-1 gap-1">
        <UnitLabel name={"Fleet Moves"} count={fleetMoves ?? 0} resource={EntityType.FleetMoves} />
      </SecondaryCard>
      <SecondaryCard className="grid grid-cols-1 gap-1">
        <UnitLabel
          name={"Minutemen Marine"}
          count={getUnitCount(EntityType.MinutemanMarine)}
          resource={EntityType.MinutemanMarine}
        />
        <UnitLabel
          name={"Trident Marine"}
          count={getUnitCount(EntityType.TridentMarine)}
          resource={EntityType.TridentMarine}
        />
        <UnitLabel
          name={"Anvil Light Drone"}
          count={getUnitCount(EntityType.AnvilLightDrone)}
          resource={EntityType.AnvilLightDrone}
        />
        <UnitLabel
          name={"Hammer Drone"}
          count={getUnitCount(EntityType.HammerLightDrone)}
          resource={EntityType.HammerLightDrone}
        />
        <UnitLabel
          name={"Stinger Drone"}
          count={getUnitCount(EntityType.StingerDrone)}
          resource={EntityType.StingerDrone}
        />
        <UnitLabel name={"Aegis Drone"} count={getUnitCount(EntityType.AegisDrone)} resource={EntityType.AegisDrone} />
        <UnitLabel
          name={"Mining Vessel"}
          count={getUnitCount(EntityType.MiningVessel)}
          resource={EntityType.MiningVessel}
        />
      </SecondaryCard>
    </>
  );
};
