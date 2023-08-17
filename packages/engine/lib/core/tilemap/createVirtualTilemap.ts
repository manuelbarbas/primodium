import { Tile, VirtualTilemap } from "./types";
import { CoordMap } from "@latticexyz/utils";
import {
  ChunkedTilemapConfig,
  createChunkedTilemap,
} from "./createChunkedTilemap";
import { WorldCoord } from "@latticexyz/phaserx/dist/types";
import { tileCoordToChunkCoord } from "@latticexyz/phaserx";

export function createVirtualTilemap<
  TileKeys extends number,
  LayerKeys extends string
>(
  config: Omit<ChunkedTilemapConfig<TileKeys, LayerKeys>, "tiles">
): VirtualTilemap<TileKeys, LayerKeys> {
  const {
    chunks,
    layerConfig: { layers, defaultLayer },
    tileWidth,
    tileHeight,
  } = config;

  const tiles: {
    [key in LayerKeys]: CoordMap<Tile>;
  } = {} as never;

  for (const layerKey of Object.keys(layers)) {
    tiles[layerKey as LayerKeys] = new CoordMap<Tile>();
  }

  const chunkedTilemap = createChunkedTilemap({ ...config, tiles });

  function putTileAt(
    coord: WorldCoord,
    tile: TileKeys,
    layer?: LayerKeys,
    tint?: number,
    alpha?: number
  ) {
    // Update virtual tilemap
    tiles[layer || defaultLayer].set(coord, {
      index: tile,
      tint,
      alpha,
    });

    // Immediately update the physical tile if the chunk is in view
    const chunk = tileCoordToChunkCoord(
      coord,
      tileWidth,
      tileHeight,
      chunks.chunkSize
    );
    if (chunkedTilemap.visible && chunks.visibleChunks.current.get(chunk)) {
      chunkedTilemap.putTileAt(coord, tile, layer, tint, alpha);
    }
  }

  return { ...chunkedTilemap, putTileAt, tiles };
}
