import { ChunkCoord, PixelCoord, Scene, TileCoord } from "engine/types";
import * as Coord from "engine/lib/util/coords";

export const createUtilApi = (scene: Scene) => {
  function pixelCoordToTileCoord(coord: PixelCoord): TileCoord {
    return Coord.pixelCoordToTileCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
  }

  function tileCoordToPixelCoord(coord: TileCoord): PixelCoord {
    return Coord.tileCoordToPixelCoord(coord, scene.config.tilemap.tileWidth, scene.config.tilemap.tileHeight);
  }

  function pixelCoordToChunkCoord(coord: PixelCoord): ChunkCoord {
    return Coord.pixelToChunkCoord(coord, scene.config.cullingChunkSize);
  }

  function tileCoordToChunkCoord(coord: TileCoord): ChunkCoord {
    return Coord.tileCoordToChunkCoord(
      coord,
      scene.config.tilemap.tileWidth,
      scene.config.tilemap.tileHeight,
      scene.config.cullingChunkSize
    );
  }

  function chunkCoordToPixelCoord(coord: ChunkCoord): PixelCoord {
    return Coord.chunkToPixelCoord(coord, scene.config.cullingChunkSize);
  }

  function chunkCoordToTileCoord(coord: ChunkCoord): TileCoord {
    return Coord.chunkCoordToTileCoord(
      coord,
      scene.config.tilemap.tileWidth,
      scene.config.tilemap.tileHeight,
      scene.config.cullingChunkSize
    );
  }

  function getVisibleChunks() {
    return scene.objects.getVisibleChunks();
  }

  return {
    pixelCoordToTileCoord,
    tileCoordToPixelCoord,
    pixelCoordToChunkCoord,
    tileCoordToChunkCoord,
    chunkCoordToPixelCoord,
    chunkCoordToTileCoord,
    getVisibleChunks,
    addCoords: Coord.addCoords,
    coordEq: Coord.coordEq,
  };
};
