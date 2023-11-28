import { Entity } from "@latticexyz/recs";
import { useCallback } from "react";
import { SecondaryCard } from "src/components/core/Card";

import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { UnitLabel } from "./UnitLabel";

export const AllUnitLabels = () => {
  const { playerEntity } = useMud().network;
  const homeAsteroid = components.Home.use(playerEntity)?.asteroid as Entity;
  const units = components.Hangar.use(homeAsteroid);

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
    <SecondaryCard className="flex flex-row w-fit gap-1 m-1">
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
        count={getUnitCount(EntityType.AnvilDrone)}
        resource={EntityType.AnvilDrone}
      />
      <UnitLabel name={"Hammer Drone"} count={getUnitCount(EntityType.HammerDrone)} resource={EntityType.HammerDrone} />
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
  );
};
