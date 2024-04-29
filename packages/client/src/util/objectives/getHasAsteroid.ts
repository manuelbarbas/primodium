import { MapIdToAsteroidType } from "@/util/mappings";
import { Entity, Has, HasValue, runQuery } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { components } from "src/network/components";
import { Hex } from "viem";

export const getHasAsteroid = (
  playerEntity: Entity | undefined,
  type: "basic" | "motherlode" | "wormhole" | "shard"
) => {
  let currentValue = 0n;
  if (type == "shard") {
    const complete =
      runQuery([Has(components.ShardAsteroid), HasValue(components.OwnedBy, { value: playerEntity as Hex })]).size > 0;
    currentValue = complete ? 1n : 0n;
  }
  const playerAsteroids = runQuery([
    HasValue(components.OwnedBy, { value: playerEntity as Hex }),
    Has(components.Asteroid),
  ]);
  if (type === "basic") currentValue = playerAsteroids.size > 1 ? 1n : 0n;
  else currentValue = [...playerAsteroids].some((asteroid) => isCorrectType(asteroid, type)) ? 1n : 0n;

  const icon = InterfaceIcons.Asteroid;
  return {
    tooltipText: `Capture a ${type} asteroid`,
    backgroundImage: icon,
    requiredValue: 1n,
    currentValue,
    isBool: true,
    scale: 1n,
  };
};

const isCorrectType = (asteroidEntity: Entity, type: "motherlode" | "wormhole" | "shard") => {
  const asteroidData = components.Asteroid.get(asteroidEntity);
  if (type === "motherlode") {
    const asteroidResource = MapIdToAsteroidType[asteroidData?.mapId ?? 0];
    return !!asteroidResource;
  }
  if (type === "wormhole") return asteroidData?.wormhole ?? false;
  if (type === "shard") return components.ShardAsteroid.has(asteroidEntity);
  return false;
};
