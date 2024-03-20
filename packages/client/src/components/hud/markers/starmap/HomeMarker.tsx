import { DepthLayers, Scenes } from "src/game/lib/mappings";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo } from "react";
import { IconMarker } from "src/components/core/Marker";
import { useMud } from "src/hooks";
import { usePrimodium } from "src/hooks/usePrimodium";

export const HomeMarker = () => {
  const {
    components,
    playerAccount: { entity: playerEntity },
  } = useMud();
  const primodium = usePrimodium();
  const homeAsteroid = components.Home.use(playerEntity)?.value ?? singletonEntity;
  const position = components.Position.use(homeAsteroid as Entity);

  const coord = useMemo(() => {
    const {
      scene: { getConfig },
    } = primodium.api(Scenes.Starmap);
    const config = getConfig(Scenes.Starmap);

    const pixelCoord = tileCoordToPixelCoord(
      position ?? { x: 0, y: 0 },
      config.tilemap.tileWidth,
      config.tilemap.tileHeight
    );

    return { x: pixelCoord.x, y: -pixelCoord.y };
  }, [position, primodium]);

  return (
    <IconMarker
      id="home-icon"
      depth={DepthLayers.Path}
      scene={Scenes.Starmap}
      coord={coord}
      iconUri="/img/icons/utilitiesicon.png"
    />
  );
};
