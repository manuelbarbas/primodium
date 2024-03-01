import { DepthLayers, Scenes } from "@game/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo } from "react";
import { IconMarker } from "src/components/core/Marker";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";

export const BuildMarker = () => {
  const primodium = usePrimodium();
  const buildAsteroid = components.BuildRock.use()?.value ?? singletonEntity;
  const position = components.Position.use(buildAsteroid as Entity);

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
      scene={Scenes.Starmap}
      depth={DepthLayers.Path - 1}
      coord={coord}
      iconUri="/img/icons/minersicon.png"
    />
  );
};
