import { createPerlin, Perlin } from "@latticexyz/noise";
import { Coord } from "@latticexyz/utils";
import { BlockType } from "./constants";

// TODO: randomize perlinSeed, 413 taken from contract
const perlinSeed = 413;

// const networkLayer = { perlin: null as null | Perlin };
// createPerlin().then((perlin) => (networkLayer.perlin = perlin));
// export default networkLayer;

export async function createNetworkLayer() {
  const perlin = await createPerlin();

  function getTerrainDepth(coord: Coord) {
    const denom = 128;
    const depth = perlin(coord.x + perlinSeed, coord.y + perlinSeed, 0, denom);
    return depth;
  }

  function getTerrainTile(coord: Coord) {
    const depth = getTerrainDepth(coord);
    if (depth < 32) return BlockType.Alluvium;
    if (depth < 16) return BlockType.Regolith;
    if (depth < 8) return BlockType.Regolith;
    if (depth < 4) return BlockType.Lithium;
    return BlockType.Water;
  }

  return {
    getTerrainTile,
    getTerrainDepth,
  };
}
