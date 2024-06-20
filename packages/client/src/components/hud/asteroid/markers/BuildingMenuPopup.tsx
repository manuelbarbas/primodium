import { Card, GlassCard } from "@/components/core/Card";
import { Widget } from "@/components/core/Widget";
import { BuildingMenu } from "@/components/hud/asteroid/building-menu/BuildingMenu";
import { useGame } from "@/hooks/useGame";
import { defaultEntity, Entity } from "@primodiumxyz/reactive-tables";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useMemo } from "react";
import { useCore } from "@primodiumxyz/core/react";

export const BuildingMenuPopup = () => {
  const { tables, utils } = useCore();
  const game = useGame();
  const building = tables.SelectedBuilding.use()?.value;
  const position = tables.Position.use(building as Entity);
  const buildingName = utils.getBuildingName(building as Entity);
  const dimensions = useMemo(() => utils.getBuildingDimensions(building ?? defaultEntity), [building]);

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
          <BuildingMenu selectedBuilding={building ?? defaultEntity} />
        </Card>
      </GlassCard>
    </Widget>
  );
};
