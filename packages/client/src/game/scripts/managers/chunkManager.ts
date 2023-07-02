import { RENDER_INTERVAL, TileAnimationKeys } from "../../constants";
import type { AnimatedTilemap } from "@latticexyz/phaserx";
import { getTopLayerKeyPair } from "../../../util/tile";
import { Coord, CoordMap } from "@latticexyz/utils";
import { createPerlin } from "@latticexyz/noise";
import { EntityIdtoTilesetId, Tilekeys } from "../../constants";
import { interval } from "rxjs";
import { Scene } from "../../../engine/types";

const chunkCache = new CoordMap<boolean>();
const perlin = createPerlin();

const renderChunk = async (
  coord: Coord,
  map: AnimatedTilemap<number, string, string>,
  chunkSize: number
) => {
  //don't render if already rendered
  if (chunkCache.get(coord)) return;

  for (let x = coord.x * chunkSize; x < coord.x * chunkSize + chunkSize; x++) {
    for (
      let y = coord.y * chunkSize;
      y < coord.y * chunkSize + chunkSize;
      y++
    ) {
      const coord = { x, y: -y };

      const { terrain, resource } = getTopLayerKeyPair(coord, await perlin);

      //lookup and place terrain
      const terrainId = EntityIdtoTilesetId[terrain];

      if (terrainId === Tilekeys.Water) {
        map.putAnimationAt({ x, y }, TileAnimationKeys.Water, "Terrain");
        continue;
      }
      //lookup and place resource
      map.putTileAt({ x, y }, terrainId ?? Tilekeys.Alluvium, "Terrain");

      if (!resource) continue;
      const resourceId = EntityIdtoTilesetId[resource!];
      map.putTileAt({ x, y }, resourceId, "Resource");
    }
  }

  chunkCache.set(coord, true);
};

export const createChunkManager = async (tilemap: Scene["tilemap"]) => {
  const { chunks, map, chunkSize } = tilemap;
  let chunkStream: ReturnType<typeof chunks.addedChunks$.subscribe>;
  let lazyChunkLoader: ReturnType<typeof setInterval>;

  const renderInitialChunks = () => {
    for (const chunk of chunks.visibleChunks.current.coords()) {
      renderChunk(chunk, map, chunkSize);
    }
  };

  const chunkQueue: Coord[] = [];
  const interval$ = interval(RENDER_INTERVAL);
  const startChunkRenderer = () => {
    chunkStream = chunks.addedChunks$.subscribe((chunk) => {
      chunkQueue.push(chunk);
    });

    interval$.subscribe(() => {
      if (chunkQueue.length === 0) return;

      const chunk = chunkQueue.pop()!;

      if (!chunks.visibleChunks.current.get(chunk)) return;

      renderChunk(chunk, map, chunkSize);
    });
  };

  const dispose = () => {
    chunkStream.unsubscribe();
    clearInterval(lazyChunkLoader);
  };

  return { renderInitialChunks, startChunkRenderer, dispose };
};
