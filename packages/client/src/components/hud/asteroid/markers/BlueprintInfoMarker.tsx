import { Card } from "@/components/core/Card";
import { Marker } from "@/components/core/Marker";
import { BlueprintInfo } from "@/components/hud/asteroid/blueprints/BlueprintInfo";
import { useGame } from "@/hooks/useGame";
import { useCore } from "@primodiumxyz/core/react";
import { useMemo } from "react";
import { defaultEntity } from "@primodiumxyz/reactive-tables";

export const BlueprintInfoMarker = () => {
  const { tables, utils } = useCore();
  const game = useGame();
  const building = tables.SelectedBuilding.use()?.value;
  const hoverCoord = tables.HoverTile.use();
  const buildingType = tables.BuildingType.use(building)?.value;
  const dimensions = useMemo(() => utils.getBuildingDimensions(building ?? defaultEntity), [building]);

  const coord = useMemo(() => {
    const { utils } = game.ASTEROID;

    const pixelCoord = utils.tileCoordToPixelCoord(
      utils.addCoords(hoverCoord ?? { x: 0, y: 0 }, { x: dimensions.width / 2, y: 1 })
    );

    return { x: pixelCoord.x, y: -pixelCoord.y };
  }, [hoverCoord, game, dimensions]);

  if (!building || !hoverCoord || buildingType) return null;

  return (
    <Marker noPointerEvents id="blueprint-info-target" scene={"ASTEROID"} coord={coord} origin="center-bottom">
      <Card noPointerEvents>
        <BlueprintInfo building={building} />
      </Card>
    </Marker>
  );
};
