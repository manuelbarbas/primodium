import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useMemo } from "react";
import { IconMarker } from "src/components/core/Marker";
import { DepthLayers } from "src/game/lib/constants/common";
import { useMud } from "src/hooks";
import { useGame } from "src/hooks/useGame";

export const HomeMarker = () => {
  const {
    components,
    playerAccount: { entity: playerEntity },
  } = useMud();
  const game = useGame();
  const homeAsteroid = components.Home.use(playerEntity)?.value ?? singletonEntity;
  const position = components.Position.use(homeAsteroid as Entity);

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
      depth={DepthLayers.Path}
      scene={"STARMAP"}
      coord={coord}
      iconUri={InterfaceIcons.Housing}
    />
  );
};
