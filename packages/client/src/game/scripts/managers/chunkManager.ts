import { RENDER_INTERVAL } from "../../constants";
import type { AnimatedTilemap } from "@latticexyz/phaserx";
import { getTopLayerKeyPair } from "../../../util/tile";
import { Coord, CoordMap } from "@latticexyz/utils";
import { createPerlin } from "@latticexyz/noise";
import { EntityIdtoTilesetId, Tilekeys } from "../../constants";
import { Scene } from "../../../util/types";

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

      try {
        //lookup and place terrain
        const terrainId = EntityIdtoTilesetId[terrain];

        if (terrainId === Tilekeys.Water) {
          // map.putTileAt({ x, y }, Tilekeys.Water);
          map.putAnimationAt({ x, y }, "Water", "Terrain");
          continue;
        }

        //lookup and place resource
        map.putTileAt({ x, y }, terrainId ?? Tilekeys.Alluvium, "Terrain");
      } catch (e) {
        // console.log(e);
      }

      try {
        if (!resource) continue;
        const resourceId = EntityIdtoTilesetId[resource!];
        map.putTileAt({ x, y }, resourceId, "Resource");
      } catch (e) {
        // console.log(e);
      }
    }
  }

  chunkCache.set(coord, true);
};

const createChunkManager = async (tilemap: Scene["tilemap"]) => {
  const { chunks, map, chunkSize } = tilemap;
  let chunkStream: ReturnType<typeof chunks.addedChunks$.subscribe>;

  const renderQueue: Coord[] = [];
  let lazyChunkLoader: ReturnType<typeof setInterval>;

  const renderInitialChunks = () => {
    for (const chunk of chunks.visibleChunks.current.coords()) {
      renderChunk(chunk, map, chunkSize);
    }
  };

  const startChunkRenderer = () => {
    chunkStream = chunks.addedChunks$.subscribe((chunk) => {
      renderQueue.push(chunk);
    });

    // distrube chunk rendering over time
    lazyChunkLoader = setInterval(() => {
      // get chunks to render. prioritize chunks that are closer to the player/just added
      const chunk = renderQueue.pop();
      if (!chunk) return;

      //check if chunk is still visible
      if (!chunks.visibleChunks.current.get(chunk)) return;

      renderChunk(chunk, map, chunkSize);
    }, RENDER_INTERVAL);
  };

  const dispose = () => {
    chunkStream.unsubscribe();
    clearInterval(lazyChunkLoader);
  };

  return { renderInitialChunks, startChunkRenderer, dispose };
};

export default createChunkManager;
