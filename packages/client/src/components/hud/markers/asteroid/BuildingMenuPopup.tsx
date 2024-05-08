import { Card, GlassCard } from "@/components/core/Card";
import { Widget } from "@/components/core/Widget";
import { BuildingMenu } from "@/components/hud/building-menu/BuildingMenu";
import { usePrimodium } from "@/hooks/usePrimodium";
import { components } from "@/network/components";
import { getBuildingDimensions, getBuildingImageFromType, getBuildingName } from "@/util/building";
import { getEntityTypeName } from "@/util/common";
import { addCoords, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useMemo } from "react";

export const BuildingMenuPopup = () => {
  const primodium = usePrimodium();
  const building = components.SelectedBuilding.use()?.value;
  const position = components.Position.use(building as Entity);
  const buildingType = components.BuildingType.use(building as Entity)?.value;
  const buildingName = getBuildingName(building as Entity);
  const dimensions = useMemo(() => getBuildingDimensions(building ?? singletonEntity), [building]);

  const coord = useMemo(() => {
    const { config } = primodium.ASTEROID;

    const pixelCoord = tileCoordToPixelCoord(
      addCoords(position ?? { x: 0, y: 0 }, { x: dimensions.width + 0.5, y: 0 }),
      config.tilemap.tileWidth,
      config.tilemap.tileHeight
    );

    return { x: pixelCoord.x, y: -pixelCoord.y };
  }, [position, primodium, dimensions]);

  return (
    <Widget
      title={getEntityTypeName(buildingType as Entity)}
      id="building-target"
      scene={"ASTEROID"}
      defaultCoord={coord}
      defaultPinned
      draggable
      defaultVisible
      origin="top-left"
      minOpacity={1}
      popUp
      noBorder
      active={!!building && !!buildingName}
      icon={getBuildingImageFromType(primodium, buildingType as Entity) ?? InterfaceIcons.Build}
    >
      <GlassCard direction={"top"}>
        <Card noDecor>
          <BuildingMenu selectedBuilding={building ?? singletonEntity} />
        </Card>
      </GlassCard>
    </Widget>
  );
};
