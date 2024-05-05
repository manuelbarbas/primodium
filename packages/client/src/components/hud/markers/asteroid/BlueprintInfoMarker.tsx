import { addCoords, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo } from "react";
import { usePrimodium } from "@/hooks/usePrimodium";
import { components } from "@/network/components";
import { getBuildingDimensions } from "@/util/building";
import { Marker } from "@/components/core/Marker";
import { Card } from "@/components/core/Card";
import { BlueprintInfo } from "@/components/hud/blueprints/BlueprintInfo";

export const BlueprintInfoMarker = () => {
  const primodium = usePrimodium();
  const building = components.SelectedBuilding.use()?.value;
  const hoverCoord = components.HoverTile.use();
  const buildingType = components.BuildingType.use(building)?.value;
  const dimensions = useMemo(() => getBuildingDimensions(building ?? singletonEntity), [building]);

  const coord = useMemo(() => {
    const {
      scene: { getConfig },
    } = primodium.api();
    const config = getConfig("ASTEROID");

    const pixelCoord = tileCoordToPixelCoord(
      addCoords(hoverCoord ?? { x: 0, y: 0 }, { x: dimensions.width / 2, y: 1 }),
      config.tilemap.tileWidth,
      config.tilemap.tileHeight
    );

    return { x: pixelCoord.x, y: -pixelCoord.y };
  }, [hoverCoord, primodium, dimensions]);

  if (!building || !hoverCoord || buildingType) return null;

  return (
    <Marker id="blueprint-info-target" scene={"ASTEROID"} coord={coord} origin="center-bottom">
      <Card>
        <BlueprintInfo building={building} />
      </Card>
    </Marker>
  );
};
