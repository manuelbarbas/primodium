import { Entity } from "@latticexyz/recs";
import { EFleetStance } from "contracts/config/enums";
import { useMemo } from "react";
import { useOrbitingFleets } from "src/hooks/useOrbitingFleets";
import { components } from "src/network/components";
import { getSpaceRockName } from "src/util/asteroid";
import { getBuildingName } from "src/util/building";
import { formatTime } from "src/util/number";
import { getMoveLength } from "src/util/send";
import { getCanSend, getFleetUnitCounts } from "src/util/unit";
import { Card } from "../../core/Card";
import { FleetInfo } from "./FleetInfo";

export const HoverInfo = () => {
  const BuildingInfo: React.FC<{ entity: Entity }> = ({ entity }) => {
    const buildingName = getBuildingName(entity);

    return (
      <Card className="ml-5 uppercase font-bold text-xs relative">
        <div className="absolute top-0 left-0 w-full h-full topographic-background-sm opacity-50" />
        <p className="z-10">{buildingName}</p>
      </Card>
    );
  };

  const RockInfo: React.FC<{ entity: Entity }> = ({ entity }) => {
    const playerEntity = components.Account.use()?.value;
    const rockName = getSpaceRockName(entity);
    const originFleet = components.Send.use()?.originFleet;
    const originFleetRock = components.FleetMovement.use(originFleet)?.destination as Entity;
    const originPosition = components.Position.use(originFleetRock);
    const destinationPosition = components.Position.use(entity);
    const moveLength =
      originPosition && destinationPosition && originFleet && playerEntity
        ? getMoveLength(
            originPosition,
            destinationPosition,
            playerEntity,
            Object.fromEntries(getFleetUnitCounts(originFleet))
          )
        : 0;
    const isTarget = moveLength > 0 && originFleet && getCanSend(originFleet, entity);

    const orbitingFleets = useOrbitingFleets(entity);
    const isBlocked = useMemo(
      () => orbitingFleets.find((fleet) => components.FleetStance.get(fleet)?.stance == EFleetStance.Block),
      [orbitingFleets]
    );

    return (
      <Card className="ml-5 uppercase font-bold text-xs relative text-center flex flex-col justify-center gap-1 items-center">
        <div className="absolute top-0 left-0 w-full h-full topographic-background-sm opacity-50 " />
        <div className="z-10">
          <p className="inline">{rockName}</p> {isBlocked && <p className="text-error inline">(BLOCKED)</p>}
        </div>
        {isTarget && <p className="text-xs opacity-70 bg-primary px-1 w-fit">ETA {formatTime(moveLength)} </p>}
      </Card>
    );
  };

  const hoverEntity = components.HoverEntity.use()?.value;

  if (!hoverEntity) return <></>;

  let content = <></>;
  if (components.BuildingType.has(hoverEntity)) content = <BuildingInfo entity={hoverEntity} />;
  else if (components.Asteroid.has(hoverEntity)) content = <RockInfo entity={hoverEntity} />;
  else if (components.IsFleet.has(hoverEntity)) content = <FleetInfo entity={hoverEntity} />;

  return (
    <div className="relative" style={{ zIndex: 1001 }}>
      {content}
    </div>
  );
};
