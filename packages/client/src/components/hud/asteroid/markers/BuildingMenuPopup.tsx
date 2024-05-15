import { Card, GlassCard } from "@/components/core/Card";
import { Widget } from "@/components/core/Widget";
import { BuildingMenu } from "@/components/hud/asteroid/building-menu/BuildingMenu";
import { useGame } from "@/hooks/useGame";
import { components } from "@/network/components";
import { getBuildingDimensions, getBuildingName } from "@/util/building";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useMemo } from "react";

export const BuildingMenuPopup = () => {
  const game = useGame();
  const building = components.SelectedBuilding.use()?.value;
  const position = components.Position.use(building as Entity);
  const buildingName = getBuildingName(building as Entity);
  const dimensions = useMemo(() => getBuildingDimensions(building ?? singletonEntity), [building]);

  const coord = useMemo(() => {
    const { utils } = game.ASTEROID;

    const pixelCoord = utils.tileCoordToPixelCoord(
      utils.addCoords(position ?? { x: 0, y: 0 }, { x: dimensions.width + 0.5, y: 0 })
    );

    return { x: pixelCoord.x, y: -pixelCoord.y };
  }, [position, game, dimensions]);

  return (
    <Widget
      title={`[${position?.x ?? 0}, ${position?.y ?? 0}]`}
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
      topBar
      active={!!building && !!buildingName}
      icon={InterfaceIcons.Build}
    >
      <GlassCard direction={"bottom"}>
        <Card noDecor className="min-w-80">
          <BuildingMenu selectedBuilding={building ?? singletonEntity} />
        </Card>
      </GlassCard>
    </Widget>
  );
};
