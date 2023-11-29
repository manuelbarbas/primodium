import { Entity } from "@latticexyz/recs";
import { useCallback, useMemo } from "react";
import { SecondaryCard } from "src/components/core/Card";

import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { EntityType, ResourceImage } from "src/util/constants";
import { UnitLabel } from "./UnitLabel";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { DefenseLabel } from "../utilities/DefenseLabel";
import { Hex } from "viem";
import { IconLabel } from "src/components/core/IconLabel";
import { formatNumber } from "src/util/common";
import { useFleetMoves } from "src/hooks/useFleetMoves";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { Badge } from "src/components/core/Badge";
import { FaExternalLinkAlt } from "react-icons/fa";

export const AllUnitLabels = () => {
  const { playerEntity } = useMud().network;
  const selectedAsteroid = components.SelectedRock.use()?.value as Entity | undefined;
  const owner = components.OwnedBy.use(selectedAsteroid)?.value as Entity | undefined;
  const units = components.Hangar.use(selectedAsteroid ?? singletonEntity);
  const fleetCount = useFleetMoves();

  const getUnitCount = useCallback(
    (unit: Entity) => {
      if (!units) return 0n;
      const index = units.units.indexOf(unit);
      if (index === -1) return 0n;
      return units.counts[index];
    },
    [units]
  );

  const attack = useMemo(
    () =>
      units?.units.reduce((acc, unit) => {
        const level =
          components.UnitLevel.getWithKeys({ entity: (owner ?? playerEntity) as Hex, unit: unit as Hex })?.value ?? 0n;
        const arrivalAttack =
          (components.P_Unit.getWithKeys({ entity: unit as Hex, level })?.attack ?? 0n) * getUnitCount(unit);
        return acc + arrivalAttack;
      }, 0n),
    [units, owner, playerEntity, getUnitCount]
  );

  return (
    <div className="flex flex-col items-center gap-1 m-1">
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
        <UnitLabel
          name={"Hammer Drone"}
          count={getUnitCount(EntityType.HammerDrone)}
          resource={EntityType.HammerDrone}
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
      <div className="text-xs opacity-75 font-bold w-full flex justify-around items-center mb-1 gap-2">
        <Badge className="flex items-center gap-1">
          <DefenseLabel />
          <IconLabel
            imageUri="/img/icons/attackicon.png"
            tooltipText="Attack"
            className="text-sm"
            text={attack ? formatNumber(attack, { short: true, fractionDigits: 2 }) : "-"}
          />
          <ResourceIconTooltip
            resource={EntityType.FleetMoves}
            className="text-sm"
            amount={fleetCount}
            name="Fleet Moves"
            playerEntity={playerEntity}
            image={ResourceImage.get(EntityType.FleetMoves) ?? ""}
          />
        </Badge>

        <Badge className="gap-1 items-center">
          <div className="animate-pulse bg-success w-1 h-1 rounded-box" />0 ATTACKING FLEETS{" "}
          <FaExternalLinkAlt className="opacity-75 scale-90" />
        </Badge>
      </div>
    </div>
  );
};
