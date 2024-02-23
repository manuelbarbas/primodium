import { Scenes } from "@game/constants";
import { addCoords, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo } from "react";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { getBuildingDimensions, getBuildingImageFromType, getBuildingName } from "src/util/building";
import { getBlockTypeName } from "src/util/common";
import { BuildingMenu } from "../../building-menu/BuildingMenu";
import { Widget } from "src/components/core/Widget";

export const BuildingMenuPopup = () => {
  const primodium = usePrimodium();
  const building = components.SelectedBuilding.use()?.value;
  const position = components.Position.use(building as Entity);
  const buildingType = components.BuildingType.use(building as Entity)?.value;
  const buildingName = getBuildingName(building as Entity);
  const dimensions = useMemo(() => getBuildingDimensions(building ?? singletonEntity), [building]);

  const coord = useMemo(() => {
    const {
      scene: { getConfig },
    } = primodium.api();
    const config = getConfig(Scenes.Asteroid);

    const pixelCoord = tileCoordToPixelCoord(
      addCoords(position ?? { x: 0, y: 0 }, { x: dimensions.width + 0.5, y: 0 }),
      config.tilemap.tileWidth,
      config.tilemap.tileHeight
    );

    return { x: pixelCoord.x, y: -pixelCoord.y };
  }, [position, primodium, dimensions]);

  return (
    <Widget
      title={getBlockTypeName(buildingType as Entity)}
      id="building-target"
      scene={Scenes.Asteroid}
      defaultCoord={coord}
      defaultPinned
      draggable
      defaultVisible
      origin="top-left"
      minOpacity={1}
      popUp
      active={!!building && !!buildingName}
      icon={getBuildingImageFromType(primodium, buildingType as Entity) ?? "img/icons/minersicon.png"}
    >
      <BuildingMenu selectedBuilding={building ?? singletonEntity} />
    </Widget>
  );
};
