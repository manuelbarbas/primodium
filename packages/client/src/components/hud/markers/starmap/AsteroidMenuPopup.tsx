import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { useMemo } from "react";
import { Widget } from "@/components/core/Widget";
import { usePrimodium } from "@/hooks/usePrimodium";
import { components } from "@/network/components";
import { GlassCard } from "@/components/core/Card";
import { InterfaceIcons } from "@primodiumxyz/assets";

import { AsteroidMenu } from "@/components/hud/asteroid-menu/AsteroidMenu";

export const AsteroidMenuPopup = () => {
  const primodium = usePrimodium();
  const selectedAsteroid = components.SelectedRock.use()?.value;
  const position = components.Position.use(selectedAsteroid);

  const coord = useMemo(() => {
    const {
      scene: { getConfig },
    } = primodium.api();
    const config = getConfig("STARMAP");

    if (!position) return { x: 0, y: 0 };

    const pixelCoord = tileCoordToPixelCoord(position, config.tilemap.tileWidth, config.tilemap.tileHeight);

    return { x: pixelCoord.x, y: -pixelCoord.y };
  }, [selectedAsteroid, primodium, position]);

  if (!selectedAsteroid) return null;

  return (
    <Widget
      title={`[${position?.x ?? 0}, ${position?.y ?? 0}]`}
      id="asteroid-target"
      scene={"STARMAP"}
      defaultCoord={coord}
      defaultPinned
      draggable
      defaultVisible
      origin="top-right"
      minOpacity={1}
      topBar
      popUp
      noBorder
      icon={InterfaceIcons.Crosshairs}
    >
      <GlassCard direction={"bottom"} className="">
        <AsteroidMenu selectedRock={selectedAsteroid} />
      </GlassCard>
    </Widget>
  );
};
