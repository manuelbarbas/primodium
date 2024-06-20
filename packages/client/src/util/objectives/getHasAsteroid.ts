import { InterfaceIcons } from "@primodiumxyz/assets";
import { Core, MapEntityLookup } from "@primodiumxyz/core";
import { Entity, query } from "@primodiumxyz/reactive-tables";

export const getHasAsteroid = (
  { tables }: Core,
  playerEntity: Entity | undefined,
  type: "common" | "motherlode" | "wormhole" | "shard"
) => {
  let currentValue = 0n;
  if (type == "shard") {
    const complete = query({
      with: [tables.ShardAsteroid],
      withProperties: [{ table: tables.OwnedBy, properties: { value: playerEntity } }],
    });
    currentValue = complete ? 1n : 0n;
  } else {
    const playerAsteroids = query({
      with: [tables.Asteroid],
      withProperties: [{ table: tables.OwnedBy, properties: { value: playerEntity } }],
    });
    if (type === "common") currentValue = playerAsteroids.length > 1 ? 1n : 0n;
    else
      currentValue = playerAsteroids.some((asteroid) => {
        const asteroidData = tables.Asteroid.get(asteroid);
        if (type === "motherlode") {
          const asteroidResource = MapEntityLookup[asteroidData?.mapId ?? 0];
          return !!asteroidResource;
        }
        if (type === "wormhole") return asteroidData?.wormhole ?? false;
        if (type === "shard") return tables.ShardAsteroid.has(asteroid);
        return false;
      })
        ? 1n
        : 0n;
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
