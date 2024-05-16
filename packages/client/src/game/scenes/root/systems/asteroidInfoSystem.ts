import { Entity, Has, defineUpdateSystem, namespaceWorld } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "src/network/components";
import { world } from "src/network/world";

// we want to keep real-time information about asteroids (owner, expansion level, owner alliance)
// AsteroidInfo component is initialized in `renderAsteroids`, whenever an asteroid enters the tables
export const asteroidInfoSystem = () => {
  const systemsWorld = namespaceWorld(world, "systems");

  // Owner
  defineUpdateSystem(
    systemsWorld,
    [Has(components.OwnedBy)],
    ({ entity, value: [current] }) => {
      const asteroidInfo = components.AsteroidInfo.get(entity);
      // bail out if asteroidInfo is not defined (meaning that this entity is not an asteroid)
      if (!asteroidInfo) return;

      components.AsteroidInfo.update({ owner: (current?.value as Entity | undefined) ?? singletonEntity }, entity);
    },
    { runOnInit: false }
  );

  // Level
  defineUpdateSystem(
    systemsWorld,
    [Has(components.Level)],
    ({ entity, value: [current] }) => {
      const asteroidInfo = components.AsteroidInfo.get(entity);
      if (!asteroidInfo) return;

      components.AsteroidInfo.update(
        { expansionLevel: (current?.value as bigint | undefined) ?? asteroidInfo.expansionLevel },
        entity
      );
    },
    { runOnInit: false }
  );

  // Alliance
  defineUpdateSystem(
    systemsWorld,
    [Has(components.PlayerAlliance)],
    ({ entity, value: [current] }) => {
      const asteroidInfo = components.AsteroidInfo.get(entity);
      if (!asteroidInfo) return;

      components.AsteroidInfo.update(
        { ownerAlliance: (current?.value as Entity | undefined) ?? singletonEntity },
        entity
      );
    },
    { runOnInit: false }
  );
};
