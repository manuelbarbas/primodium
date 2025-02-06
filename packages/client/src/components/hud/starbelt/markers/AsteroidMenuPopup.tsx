import { useMemo } from "react";

import { InterfaceIcons } from "@primodiumxyz/assets";
import { entityToRockName, Mode } from "@primodiumxyz/core";
import { useCore } from "@primodiumxyz/core/react";
import { GlassCard } from "@/components/core/Card";
import { Widget } from "@/components/core/Widget";
import { AsteroidMenu } from "@/components/hud/starbelt/asteroid-menu/AsteroidMenu";
import { useGame } from "@/hooks/useGame";

export const AsteroidMenuPopup = () => {
  const game = useGame();
  const { tables } = useCore();
  const selectedAsteroid = tables.SelectedRock.use()?.value;
  const position = tables.Position.use(selectedAsteroid);
  const mapOpen = tables.SelectedMode.use()?.value === Mode.Starmap;

  const coord = useMemo(() => {
    const { utils } = game.STARMAP;

    if (!position) return { x: 0, y: 0 };

    const pixelCoord = utils.tileCoordToPixelCoord(position);

    return { x: pixelCoord.x + 32, y: -pixelCoord.y - 8 };
  }, [game, position]);

  if (!selectedAsteroid || !mapOpen) return null;

  return (
    <Widget
      title={entityToRockName(selectedAsteroid)}
      id="asteroid-target"
      scene={"STARMAP"}
      defaultCoord={coord}
      defaultPinned
      draggable
      defaultVisible
      origin="top-left"
      minOpacity={1}
      topBar
      popUp
      noBorder
      icon={InterfaceIcons.Crosshairs}
    >
      <GlassCard direction={"bottom"}>
        <AsteroidMenu selectedRock={selectedAsteroid} />
      </GlassCard>
    </Widget>
  );
};
