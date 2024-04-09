import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Entity } from "@latticexyz/recs";
import { useMemo, useRef } from "react";
import { Marker } from "src/components/core/Marker";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { DepthLayers } from "src/game/lib/constants/common";
import { useMud } from "src/hooks";
import { useShardAsteroid } from "src/hooks/conquest/useShardAsteroid";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { claimShardAsteroid } from "src/network/setup/contractCalls/claimConquest";
import { getAsteroidImage } from "src/util/asteroid";
import { EntityType } from "src/util/constants";
import { formatResourceCount } from "src/util/number";
import { Button } from "../../../core/Button";

export const _ShardAsteroidTarget: React.FC<{ selectedAsteroid: Entity }> = ({ selectedAsteroid }) => {
  const mud = useMud();
  const {
    playerAccount: { entity: playerEntity },
  } = mud;
  const primodium = usePrimodium();
  const {
    scene: { getConfig },
    hooks: { useCamera },
  } = useRef(primodium.api("STARMAP")).current;

  const shardData = useShardAsteroid(selectedAsteroid);
  const ownedBy = components.OwnedBy.use(selectedAsteroid)?.value;
  const mapOpen = components.MapOpen.use()?.value ?? false;
  const position = components.Position.use(selectedAsteroid);
  const imageUri = getAsteroidImage(primodium, selectedAsteroid);

  const { zoom } = useCamera();
  const ownedByPlayer = ownedBy === playerEntity;

  const [coord, defaultZoom, minZoom] = useMemo(() => {
    const config = getConfig("STARMAP");

    if (!config) throw Error("No config found for scene");

    const {
      tilemap: { tileHeight, tileWidth },
      camera: { defaultZoom, minZoom },
    } = config;

    const pixelCoord = tileCoordToPixelCoord(position ?? { x: 0, y: 0 }, tileWidth, tileHeight);

    return [{ x: pixelCoord.x, y: -pixelCoord.y }, defaultZoom, minZoom];
  }, [position, getConfig]);

  if (!mapOpen) return <></>;

  return (
    <Marker
      scene={"STARMAP"}
      coord={coord}
      id={`asteroid-target`}
      offScreenIconUri="/img/icons/attackicon.png"
      depth={DepthLayers.Path - 5}
    >
      <div
        className="w-14 h-14 border-2 border-error flex items-center justify-center"
        style={{
          background: `rgba(0,0,0, ${Math.max(0, (defaultZoom - zoom) / (defaultZoom - minZoom))}`,
        }}
      >
        {shardData && ownedByPlayer && shardData.canExplode && (
          <TransactionQueueMask
            queueItemId={"Conquest" as Entity}
            className="absolute bottom-0 left-0 -translate-x-full w-28"
          >
            <Button
              onClick={() => claimShardAsteroid(mud, selectedAsteroid)}
              className="victory-bg btn-xs w-full text-xs text-black border border-r-0 border-secondary/50"
            >
              CLAIM{" "}
              {formatResourceCount(EntityType.Iron, shardData.explodePoints, {
                notLocale: true,
                fractionDigits: 2,
              }).toLocaleString()}{" "}
              PTS
            </Button>
          </TransactionQueueMask>
        )}
        {shardData && !!ownedBy && !ownedByPlayer && shardData.canExplode && (
          <TransactionQueueMask
            queueItemId={"Conquest" as Entity}
            className="absolute bottom-0 left-0 -translate-x-full w-28"
          >
            <Button
              onClick={() => claimShardAsteroid(mud, selectedAsteroid)}
              className="victory-bg btn-xs w-full text-xs text-black border border-r-0 border-secondary/50"
            >
              EXPLODE
            </Button>
          </TransactionQueueMask>
        )}

        <img
          src={imageUri}
          className="scale-75"
          style={{ opacity: `${Math.max(0, ((defaultZoom - zoom) / (defaultZoom - minZoom)) * 100)}%` }}
        />
      </div>
    </Marker>
  );
};
