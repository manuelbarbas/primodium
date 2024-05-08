import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useMemo } from "react";
import { IconMarker } from "src/components/core/Marker";
import { DepthLayers } from "src/game/lib/constants/common";
import { useGame } from "src/hooks/useGame";
import { components } from "src/network/components";

export const BuildMarker = () => {
  const game = useGame();
  const buildAsteroid = components.BuildRock.use()?.value ?? singletonEntity;
  const position = components.Position.use(buildAsteroid as Entity);

  const coord = useMemo(() => {
    const { config } = game.STARMAP;

    const pixelCoord = tileCoordToPixelCoord(
      position ?? { x: 0, y: 0 },
      config.tilemap.tileWidth,
      config.tilemap.tileHeight
    );

    return { x: pixelCoord.x, y: -pixelCoord.y };
  }, [position, game]);

  return (
    <IconMarker
      id="home-icon"
      scene={"STARMAP"}
      depth={DepthLayers.Path - 1}
      coord={coord}
      iconUri={InterfaceIcons.Build}
    />
  );
};
