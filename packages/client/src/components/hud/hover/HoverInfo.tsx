import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { getBuildingName } from "src/util/building";
import { Card } from "../../core/Card";
import { BlueprintInfo } from "../panes/blueprints/BlueprintInfo";
import { AsteroidHover } from "./AsteroidHover";
import { FleetHover } from "./FleetHover";
import { ShardAsteroidHover } from "./ShardAsteroidHover";

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

  const hoverEntity = components.HoverEntity.use()?.value;

  if (!hoverEntity) return <></>;

  let content = <></>;
  if (components.BuildingType.has(hoverEntity)) content = <BuildingInfo entity={hoverEntity} />;
  else if (components.Asteroid.has(hoverEntity)) content = <AsteroidHover entity={hoverEntity} />;
  else if (components.ShardAsteroid.has(hoverEntity)) content = <ShardAsteroidHover entity={hoverEntity} />;
  else if (components.IsFleet.has(hoverEntity)) content = <FleetHover entity={hoverEntity} />;
  else if (components.P_Blueprint.has(hoverEntity)) content = <BlueprintInfo building={hoverEntity} />;

  return (
    <div className="relative" style={{ zIndex: 1001 }}>
      {content}
    </div>
  );
};
