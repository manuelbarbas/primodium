import { AsteroidMap } from "../../../constants";
import type { AnimatedTilemap } from "@latticexyz/phaserx";
import { getTopLayerKeyPair } from "../../../../util/tile";
import { Coord, CoordMap } from "@latticexyz/utils";
import { Perlin, createPerlin } from "@latticexyz/noise";
import { interval } from "rxjs";
import { Scene } from "engine/types";
import { world } from "src/network/world";
import { outOfBounds } from "src/util/outOfBounds";
import { EntityID } from "@latticexyz/recs";

const renderChunk = async (
  player: EntityID,
  coord: Coord,
  map: AnimatedTilemap<number, string, string>,
  chunkSize: number,
  chunkCache: CoordMap<boolean>,
  perlin: Perlin,
  ignoreCache?: boolean
) => {
  const { Tilekeys, EntityIdtoTilesetId, TileAnimationKeys } = AsteroidMap;
  //don't render if already rendered
  if (!ignoreCache && chunkCache.get(coord)) return;

  // console.log("updating chunks");
  for (let x = coord.x * chunkSize; x < coord.x * chunkSize + chunkSize; x++) {
    for (
      let y = coord.y * chunkSize;
      y < coord.y * chunkSize + chunkSize;
      y++
    ) {
      const coord = { x, y: -y };

      const { terrain, resource } = getTopLayerKeyPair(coord, perlin);

      const tint = outOfBounds(player, coord) ? 0x696969 : undefined;
      //lookup and place terrain
      const terrainId = EntityIdtoTilesetId[terrain];

      if (terrainId === Tilekeys.Water) {
        map.putAnimationAt({ x, y }, TileAnimationKeys.Water, "Terrain");
        continue;
      }
      //lookup and place resource
      map.putTileAt({ x, y }, terrainId ?? Tilekeys.Alluvium, "Terrain", tint);

      if (!resource) continue;
      const resourceId = EntityIdtoTilesetId[resource!];
      map.putTileAt({ x, y }, resourceId, "Resource", tint);
    }
  }

  chunkCache.set(coord, true);
};

export const setupAsteroidChunkManager = async (
  player: EntityID,
  tilemap: Scene["tilemap"]
) => {
  const { RENDER_INTERVAL } = AsteroidMap;
  const { chunks, map, chunkSize } = tilemap;
  const chunkCache = new CoordMap<boolean>();
  const perlin = await createPerlin();

  const renderInitialChunks = (ignoreCache?: boolean) => {
    for (const chunk of chunks.visibleChunks.current.coords()) {
      renderChunk(
        player,
        chunk,
        map,
        chunkSize,
        chunkCache,
        perlin,
        ignoreCache
      );
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

      renderChunk(player, chunk, map, chunkSize, chunkCache, perlin);
    });

    world.registerDisposer(() => {
      chunkStream.unsubscribe();
      chunkRenderer.unsubscribe();
    }, "game");
  };

  return { renderInitialChunks, startChunkRenderer };
};
