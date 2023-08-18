import { AsteroidMap } from "../../../constants";
import type { AnimatedTilemap } from "@latticexyz/phaserx";
import { getTopLayerKeyPair } from "../../../../util/tile";
import { Coord, CoordMap } from "@latticexyz/utils";
import { interval } from "rxjs";
import { Scene } from "engine/types";
import { world } from "src/network/world";
import AsteroidTiledMap from "../../../../maps/asteroid_0.7.json";

const { TileKeys, EntityIdtoTilesetId, TileAnimationKeys } = AsteroidMap;

const renderChunk = async (
  coord: Coord,
  map: AnimatedTilemap<number, string, string>,
  chunkSize: number,
  chunkCache: CoordMap<boolean>
) => {
  //don't render if already rendered
  if (chunkCache.get(coord)) return;

  for (let x = coord.x * chunkSize; x < coord.x * chunkSize + chunkSize; x++) {
    for (
      let y = coord.y * chunkSize;
      y < coord.y * chunkSize + chunkSize;
      y++
    ) {
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

        //   // if (layer.name !== "Base") continue;
        //   // y * mapWidth + x

        const tile =
          layer.data[tileCoord.x + tileCoord.y * AsteroidTiledMap.width];

        if (tile > 0) {
          map.putTileAt({ x, y }, tile, layer.name);
        }

        //   // if (tile > 0) return TerrainTilesetIdToEntityId[tile - 1];
        // }

        // const { terrain, resource } = getTopLayerKeyPair(coord);

        // if (!terrain) continue;

        //lookup and place terrain
        // const terrainId = EntityIdtoTilesetId[terrain];

        // if (terrainId === TileKeys.Water) {
        //   // map.putAnimationAt({ x, y }, TileAnimationKeys.Water, "Terrain");
        //   continue;
        // }
        //lookup and place resource
        // map.putTileAt({ x, y }, terrainId ?? TileKeys.Alluvium, "Terrain");

        // if (!resource) continue;
        // const resourceId = EntityIdtoTilesetId[resource!];
        // map.putTileAt({ x, y }, resourceId, "Resource");
      }
    }
  }

  chunkCache.set(coord, true);
};

const renderBounds = (
  upperLeft: Coord,
  bottomRight: Coord,
  map: AnimatedTilemap<number, string, string>
) => {
  for (let x = upperLeft.x; x <= bottomRight.x; x++) {
    for (let y = upperLeft.y; y <= bottomRight.y; y++) {
      const coord = { x, y: -y };

      const { terrain, resource } = getTopLayerKeyPair(coord);

      if (!terrain) return;
      //lookup and place terrain
      const terrainId = EntityIdtoTilesetId[terrain];

      if (terrainId === TileKeys.Water) {
        map.putAnimationAt({ x, y }, TileAnimationKeys.Water, "Terrain");
        continue;
      }
      //lookup and place resource
      map.putTileAt({ x, y }, terrainId ?? TileKeys.Alluvium, "Terrain");

      if (!resource) continue;
      const resourceId = EntityIdtoTilesetId[resource!];
      map.putTileAt({ x, y }, resourceId, "Resource");
    }
  }
};

export const setupTileManager = async (tilemap: Scene["tilemap"]) => {
  const { RENDER_INTERVAL } = AsteroidMap;
  const { chunks, map, chunkSize } = tilemap;
  const chunkCache = new CoordMap<boolean>();

  const renderInitialChunks = () => {
    for (const chunk of chunks.visibleChunks.current.coords()) {
      renderChunk(chunk, map, chunkSize, chunkCache);
    }
  };

  const renderMapBounds = (upperLeft: Coord, bottomRight: Coord) => {
    renderBounds(upperLeft, bottomRight, map);
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

  return { renderInitialChunks, startChunkRenderer, renderMapBounds };
};
