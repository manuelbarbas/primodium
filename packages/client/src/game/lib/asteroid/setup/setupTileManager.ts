import { Coord, CoordMap } from "@latticexyz/utils";
import { AnimatedTilemap } from "engine/lib/core/tilemap/types";
import { Scene } from "engine/types";
import { interval } from "rxjs";
import { world } from "src/network/world";
import AsteroidTiledMap from "../../../../maps/asteroid_0.7.json";
import { getResourceKey } from "../../../../util/tile";
import { RENDER_INTERVAL, ResourceToTilesetKey, Tilesets } from "../../../constants";

const renderChunk = async (
  coord: Coord,
  map: AnimatedTilemap<number, string, string>,
  chunkSize: number,
  chunkCache: CoordMap<boolean>
) => {
  //don't render if already rendered
  if (chunkCache.get(coord)) return;

  for (let x = coord.x * chunkSize; x < coord.x * chunkSize + chunkSize; x++) {
    for (let y = coord.y * chunkSize; y < coord.y * chunkSize + chunkSize; y++) {
      //get map offset from tiled properties, [0] = x offset, [1] = y offset
      const tileCoord = {
        x: x + AsteroidTiledMap.properties[0].value,
        y: y + AsteroidTiledMap.properties[1].value,
      };

      if (
        tileCoord.x < 0 ||
        tileCoord.x > AsteroidTiledMap.width - 1 ||
        tileCoord.y < 0 ||
        tileCoord.y > AsteroidTiledMap.height
      )
        continue;

      for (let i = AsteroidTiledMap.layers.length - 1; i >= 0; i--) {
        const layer = AsteroidTiledMap.layers[i];

        const tile = layer.data[tileCoord.x + tileCoord.y * AsteroidTiledMap.width];

        if (tile > 0) {
          map.putTileAt({ x, y }, tile, layer.name);
        }
      }

      const resource = getResourceKey({ x, y });

      if (!resource) continue;

      const resourceId = ResourceToTilesetKey[resource] ?? 0;

      map.putTileAt({ x, y: -y }, resourceId, Tilesets.Resource);
    }
  }

  chunkCache.set(coord, true);
};

export const setupTileManager = async (tilemap: Scene["tilemap"]) => {
  const { chunks, map, chunkSize } = tilemap;
  const chunkCache = new CoordMap<boolean>();

  if (!map) return;

  const renderInitialChunks = () => {
    for (const chunk of chunks.visibleChunks.current.coords()) {
      renderChunk(chunk, map, chunkSize, chunkCache);
    }
  };

  const startChunkRenderer = () => {
    const chunkQueue: Coord[] = [];
    const interval$ = interval(RENDER_INTERVAL);
    const chunkStream = chunks.addedChunks$.subscribe((chunk) => {
      chunkQueue.push(chunk);
    });

    const chunkRenderer = interval$.subscribe(() => {
      if (chunkQueue.length === 0) return;

      const chunk = chunkQueue.pop()!;

      if (!chunks.visibleChunks.current.get(chunk)) return;

      renderChunk(chunk, map, chunkSize, chunkCache);
    });

    world.registerDisposer(() => {
      chunkStream.unsubscribe();
      chunkRenderer.unsubscribe();
    }, "game");
  };

  return { renderInitialChunks, startChunkRenderer };
};
