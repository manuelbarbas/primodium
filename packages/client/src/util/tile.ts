import { Perlin } from "@latticexyz/noise";
import { EntityID, Has, HasValue, Not, runQuery } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { BlockType, DisplayKeyPair } from "./constants";
import {
  Position,
  BuildingType,
  OwnedBy,
  P_Terrain,
} from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { ActiveAsteroid } from "src/network/components/clientComponents";
import { hashKeyCoord } from "./encode";

// TODO: randomize perlinSeed
const perlinSeed1 = 60194;
const perlinSeed2 = 74037;
const perlinSeed3 = 53092;
const perlinSeed4 = 17326;

export function getSingleDepth(
  coord: Coord,
  perlin: Perlin,
  perlinSeed: number,
  denom: number
) {
  const depth = perlin(coord.x + perlinSeed, coord.y + perlinSeed, 0, denom);
  return depth;
}

//landscape blocks terrain generation
export function getTerrainNormalizedDepth(coord: Coord, perlin: Perlin) {
  const denom = 12;
  const depth1 = getSingleDepth(coord, perlin, perlinSeed1, denom);
  const depth2 = getSingleDepth(coord, perlin, perlinSeed2, denom);
  const depth3 = getSingleDepth(coord, perlin, perlinSeed3, denom);
  const depth4 = getSingleDepth(coord, perlin, perlinSeed4, denom);

  const normalizedDepth = ((depth1 + depth2 + depth3 + depth4) / 5) * 100;
  return Math.floor(normalizedDepth);
}

export function getTerrainKey(coord: Coord, perlin: Perlin) {
  const normalizedDepth = getTerrainNormalizedDepth(coord, perlin);
  if (normalizedDepth <= 32) return BlockType.Biofilm;
  if (normalizedDepth <= 35) return BlockType.Alluvium;
  if (normalizedDepth <= 39) return BlockType.Sandstone;
  if (normalizedDepth <= 48) return BlockType.Regolith;

  return BlockType.Bedrock;
}

export function getResourceKey(coord: Coord) {
  const coordEntity = hashKeyCoord("terrain", {
    ...coord,
    parent: "0" as EntityID,
  });
  const resource = P_Terrain.get(coordEntity, { value: BlockType.Air })?.value;

  // temp: until we have the sprites in the game
  if (resource == BlockType.Water) {
    return BlockType.Osmium;
  }

  if (resource == BlockType.Sulfur) {
    return BlockType.Titanium;
  }
  return resource;
}
const topLayerKeys = new Map<string, EntityID>();

export function getTopLayerKey(coord: Coord, perlin: Perlin) {
  const coordKey = `${coord.x}-${coord.y}`; // Assuming 2D coords. Adjust if needed.

  if (topLayerKeys.has(coordKey)) return topLayerKeys.get(coordKey);

  const terrainKey = getTerrainKey(coord, perlin);
  const resourceKey = getResourceKey(coord);
  let result;

  if (resourceKey === BlockType.Air || terrainKey === BlockType.Water) {
    result = terrainKey;
  } else {
    result = resourceKey;
  }

  topLayerKeys.set(coordKey, result);
  return result;
}

export function getTopLayerKeyPair(
  coord: Coord,
  perlin: Perlin
): DisplayKeyPair {
  // todo: pull this from the Dimensions component
  const asteroidDimensions = { width: 37, length: 25 };
  if (
    coord.x < 0 ||
    coord.x > asteroidDimensions.width ||
    coord.y < 0 ||
    coord.y > asteroidDimensions.length
  ) {
    return { terrain: null, resource: null };
  }
  const terrainKey = getTerrainKey(coord, perlin);
  const resourceKey = getResourceKey(coord);

  if (resourceKey === BlockType.Air || terrainKey === BlockType.Water) {
    return { terrain: terrainKey, resource: null };
  } else {
    return { terrain: terrainKey, resource: resourceKey };
  }
}

//gets all tiles of a certain type within a certain range with the origin being the center
export function getTilesOfTypeInRange(
  origin: Coord,
  type: EntityID,
  range: number,
  excludeRange: number,
  perlin: Perlin
): Coord[] {
  const tiles: Coord[] = [];

  for (let x = -range; x <= range; x++) {
    for (let y = -range; y <= range; y++) {
      // If the current tile is within the exclude range, skip it
      if (Math.abs(x) <= excludeRange && Math.abs(y) <= excludeRange) {
        continue;
      }

      const currentCoord = { x: origin.x + x, y: origin.y + y };
      const keyPair = getTopLayerKeyPair(currentCoord, perlin);
      if (keyPair.resource === type || keyPair.terrain === type) {
        tiles.push(currentCoord);
      }
    }
  }

  return tiles;
}

export function getBuildingsOfTypeInRange(
  origin: Coord,
  type: EntityID,
  range: number
) {
  const tiles: Coord[] = [];

  for (let x = -range; x <= range; x++) {
    for (let y = -range; y <= range; y++) {
      const currentCoord = { x: origin.x + x, y: origin.y + y };

      //get entity at coord
      const entities = runQuery([
        HasValue(Position, currentCoord),
        Has(BuildingType),
      ]);

      const buildingType = BuildingType.get(
        entities.values().next().value
      )?.value;

      if (type === buildingType) {
        tiles.push(currentCoord);
      }
    }
  }

  return tiles;
}

export const getEntityTileAtCoord = (coord: Coord) => {
  const entities = runQuery([HasValue(Position, coord), Has(BuildingType)]);

  if (!entities.size) return undefined;

  const tileEntityID = entities.values().next().value;

  return BuildingType.get(tileEntityID)?.value;
};

export const getBuildingAtCoord = (coord: Coord) => {
  const entities = runQuery([
    HasValue(Position, {
      x: coord.x,
      y: coord.y,
      parent: ActiveAsteroid.get()?.value,
    }),
    Not(BuildingType),
  ]);

  if (entities.size === 0) return undefined;
  const tileEntity = [...entities][0];

  return OwnedBy.get(world.entities[tileEntity])?.value;
};
