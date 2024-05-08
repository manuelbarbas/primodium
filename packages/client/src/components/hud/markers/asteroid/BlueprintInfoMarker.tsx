import { Card } from "@/components/core/Card";
import { Marker } from "@/components/core/Marker";
import { BlueprintInfo } from "@/components/hud/blueprints/BlueprintInfo";
import { useGame } from "@/hooks/useGame";
import { components } from "@/network/components";
import { getBuildingDimensions } from "@/util/building";
import { addCoords, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo } from "react";

export const BlueprintInfoMarker = () => {
  const game = useGame();
  const building = components.SelectedBuilding.use()?.value;
  const hoverCoord = components.HoverTile.use();
  const buildingType = components.BuildingType.use(building)?.value;
  const dimensions = useMemo(() => getBuildingDimensions(building ?? singletonEntity), [building]);

  const coord = useMemo(() => {
    const { config } = game.ASTEROID;

    const pixelCoord = tileCoordToPixelCoord(
      addCoords(hoverCoord ?? { x: 0, y: 0 }, { x: dimensions.width / 2, y: 1 }),
      config.tilemap.tileWidth,
      config.tilemap.tileHeight
    );

    return { x: pixelCoord.x, y: -pixelCoord.y };
  }, [hoverCoord, game, dimensions]);

  if (!building || !hoverCoord || buildingType) return null;

  return (
    <Marker id="blueprint-info-target" scene={"ASTEROID"} coord={coord} origin="center-bottom">
      <Card>
        <BlueprintInfo building={building} />
      </Card>
    </Marker>
  );
};
