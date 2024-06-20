import { Entity } from "@primodiumxyz/reactive-tables";
import { Card } from "../../../core/Card";
import { BlueprintInfo } from "@/components/hud/asteroid/blueprints/BlueprintInfo";
import { AsteroidHover } from "./AsteroidHover";
import { FleetHover } from "./FleetHover";
import { ShardAsteroidHover } from "./ShardAsteroidHover";
import { useCore } from "@primodiumxyz/core/react";

export const HoverInfo = () => {
  const { tables, utils } = useCore();
  const BuildingInfo: React.FC<{ entity: Entity }> = ({ entity }) => {
    const buildingName = utils.getBuildingName(entity);

    return (
      <div className="uppercase font-bold text-xs relative p-1">
        <div className="absolute top-0 left-0 w-full h-full topographic-background-sm opacity-50" />
        <p className="z-10">{buildingName}</p>
      </div>
    );
  };

  const hoverEntity = tables.HoverEntity.use()?.value;

  if (!hoverEntity) return <></>;

  let content = <></>;
  if (tables.BuildingType.has(hoverEntity)) content = <BuildingInfo entity={hoverEntity} />;
  else if (tables.Asteroid.has(hoverEntity)) content = <AsteroidHover entity={hoverEntity} />;
  else if (tables.ShardAsteroid.has(hoverEntity)) content = <ShardAsteroidHover entity={hoverEntity} />;
  else if (tables.IsFleet.has(hoverEntity)) content = <FleetHover entity={hoverEntity} />;
  else if (tables.P_Blueprint.has(hoverEntity)) content = <BlueprintInfo building={hoverEntity} />;

  return (
    <Card
      noPointerEvents
      className="relative ml-5 !heropattern-graphpaper-slate-800/50 shadow-2xl shadow-secondary/25 border-0 animate-in fade-in-50 zoom-in-90 duration-150"
      noDecor
    >
      {content}
    </Card>
  );
};
