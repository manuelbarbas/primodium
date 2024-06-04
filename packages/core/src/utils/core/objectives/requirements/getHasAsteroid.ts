import { MapIdToAsteroidType } from "@/mappings";
import { Components } from "@/lib/types";
import { Entity, Has, HasValue, runQuery } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { Hex } from "viem";

export const getHasAsteroid = (
  components: Components,
  playerEntity: Entity | undefined,
  type: "common" | "motherlode" | "wormhole" | "shard"
) => {
  let currentValue = 0n;
  if (type == "shard") {
    const complete =
      runQuery([Has(components.ShardAsteroid), HasValue(components.OwnedBy, { value: playerEntity as Hex })]).size > 0;
    currentValue = complete ? 1n : 0n;
  } else {
    const playerAsteroids = runQuery([
      HasValue(components.OwnedBy, { value: playerEntity as Hex }),
      Has(components.Asteroid),
    ]);
    if (type === "common") currentValue = playerAsteroids.size > 1 ? 1n : 0n;
    else {
      const someIsCorrectType = [...playerAsteroids].some((asteroidEntity) => {
        const asteroidData = components.Asteroid.get(asteroidEntity);
        if (type === "motherlode") {
          const asteroidResource = MapIdToAsteroidType[asteroidData?.mapId ?? 0];
          return !!asteroidResource;
        }
        if (type === "wormhole") return asteroidData?.wormhole ?? false;
        if (type === "shard") return components.ShardAsteroid.has(asteroidEntity);
        return false;
      });

      currentValue = someIsCorrectType ? 1n : 0n;
    }
  }

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
