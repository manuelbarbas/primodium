import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { getSpaceRockName } from "src/util/asteroid";
import { getBuildingName } from "src/util/building";
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
    const rockName = getSpaceRockName(entity);
    const isTarget = !!components.Send.get()?.originFleet;

    return (
      <Card className="ml-5 uppercase font-bold text-xs relative text-center">
        <div className="absolute top-0 left-0 w-full h-full topographic-background-sm opacity-50" />
        {isTarget && <p className="z-10 text-error">SEND TO</p>}
        <p className="z-10">{rockName}</p>
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
