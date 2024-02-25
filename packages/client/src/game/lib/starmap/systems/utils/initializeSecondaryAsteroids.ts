import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getSecondaryAsteroidEntity, toHex32 } from "src/util/encode";
import { getPositionByVector } from "src/util/vector";

const emptyData = {
  __staticData: "",
  __encodedLengths: "",
  __dynamicData: "",
};

export function initializeSecondaryAsteroids(sourceEntity: Entity, source: Coord) {
  const config = components.P_GameConfig.get();
  if (!config) throw new Error("GameConfig not found");
  for (let i = 0; i < config.maxAsteroidsPerPlayer; i++) {
    const asteroidPosition = getPositionByVector(
      Number(config.asteroidDistance),
      Math.floor((i * 360) / Number(config.maxAsteroidsPerPlayer)),
      source
    );

    if (components.ReversePosition.getWithKeys(asteroidPosition)) continue;
    const asteroidEntity = getSecondaryAsteroidEntity(sourceEntity, asteroidPosition);
    world.registerEntity({ id: asteroidEntity });
    components.ReversePosition.setWithKeys({ entity: asteroidEntity as string, ...emptyData }, asteroidPosition);

    if (!isSecondaryAsteroid(asteroidEntity, Number(config.asteroidChanceInv))) continue;

    const asteroidData = getAsteroidData(asteroidEntity);
    console.log("Setting data for secondary asteroid", asteroidEntity);
    components.Asteroid.set({ ...emptyData, ...asteroidData }, asteroidEntity);
    components.Position.set({ ...emptyData, ...asteroidPosition, parent: toHex32("0") }, asteroidEntity);
  }
}

function isSecondaryAsteroid(entity: Entity, chanceInv: number) {
  const motherlodeType = getByteUInt(entity, 6, 128);
  return motherlodeType % chanceInv === 1;
}

function getAsteroidData(asteroidEntity: Entity) {
  const distributionVal = getByteUInt(asteroidEntity, 7, 12) % 100;
  let maxLevel = 8;
  // //micro
  if (distributionVal <= 50) {
    maxLevel = 1;
    //small
  } else if (distributionVal <= 75) {
    maxLevel = 3;
    //medium
  } else if (distributionVal <= 90) {
    maxLevel = 5;
    //large
  }

  const mapId = (getByteUInt(asteroidEntity, 3, 20) % 4) + 2;
  return { isAsteroid: true, maxLevel: BigInt(maxLevel), mapId: mapId, spawnsSecondary: false };
}

const ONE = BigInt(1);
const getByteUInt = (_b: Entity, length: number, shift: number): number => {
  const b = BigInt(_b);
  const mask = ((ONE << BigInt(length)) - ONE) << BigInt(shift);
  const _byteUInt = (b & mask) >> BigInt(shift);
  return Number(_byteUInt);
};
