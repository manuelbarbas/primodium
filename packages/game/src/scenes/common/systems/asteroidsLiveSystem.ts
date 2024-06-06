import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "@primodiumxyz/core/network/components";
import { world } from "@primodiumxyz/core/network/world";
import { decodeAllianceName, getAllianceName } from "@primodiumxyz/core/util/alliance";
import { entityToColor } from "@primodiumxyz/core/util/color";
import { EntityType } from "@primodiumxyz/core/util/constants";
import { entityToPlayerName, entityToRockName } from "@primodiumxyz/core/util/name";
import { getEnsName } from "@primodiumxyz/core/util/web3/getEnsName";

import { PrimodiumScene } from "@/api/scene";
import { MainbaseLevelToEmblem } from "@/lib/mappings";

// Setup the asteroid label updates over visible entities
// Systems will be executed inside the starmap and command center scenes
// They will fire on any change to entities only if they are visible, otherwise it will wait for it to become visible to run the update
// (meaning moving inside the starmap, or entering/exiting the command center)
export const asteroidsLiveSystem = (starmapScene: PrimodiumScene, commandCenterScene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const scenes = [starmapScene, commandCenterScene];
  const deferredStarmapContainer = starmapScene.objects.deferredRenderContainer.getContainer(EntityType.Asteroid);

  const playerEntity = components.Account.get()?.value;

  /* --------------------------------- UPDATE --------------------------------- */

  const updateAsteroidLabel = (
    scene: PrimodiumScene,
    asteroidEntity: Entity,
    ownerEntity?: Entity,
    expansionLevel?: bigint,
    ownerAllianceEntity?: Entity,
    ownerAllianceName?: string
  ) => {
    const asteroid = scene.objects.asteroid.get(asteroidEntity);
    if (!asteroid) return;

    const playerHomeEntity = components.Home.get(playerEntity)?.value as Entity | undefined;

    if (ownerEntity) {
      const isHome = playerHomeEntity === asteroidEntity;
      const ownedByPlayer = ownerEntity === playerEntity;
      const asteroidLabel = asteroid.getAsteroidLabel();

      asteroidLabel.setProperties({
        nameLabel: entityToRockName(asteroidEntity) + (isHome ? " *" : ""),
        nameLabelColor: ownedByPlayer
          ? 0xffff00
          : components.Asteroid.get(asteroidEntity)?.spawnsSecondary
          ? 0x00ffff
          : 0xffffff,
        ownerLabel: ownedByPlayer
          ? "You"
          : ownerEntity === singletonEntity
          ? "unowned"
          : entityToPlayerName(ownerEntity),
      });

      // we want to do this after to not block the rest of the update
      getEnsName(playerEntity).then((addressObj) => {
        if (addressObj.ensName) asteroidLabel.setProperties({ ownerLabel: addressObj.ensName });
      });
    }

    if (expansionLevel) {
      asteroid.getAsteroidLabel().setProperties({
        emblemSprite:
          MainbaseLevelToEmblem[Phaser.Math.Clamp(Number(expansionLevel) - 1, 0, MainbaseLevelToEmblem.length - 1)],
      });
    }

    if (ownerAllianceEntity) {
      const hasAlliance = ownerAllianceEntity && ownerAllianceEntity !== singletonEntity;

      if (hasAlliance) {
        asteroid.getAsteroidLabel().setProperties({
          allianceLabel: ownerAllianceName
            ? decodeAllianceName(ownerAllianceName, true)
            : getAllianceName(ownerAllianceEntity, true),
          allianceLabelColor: parseInt(entityToColor(ownerAllianceEntity).slice(1), 16),
        });
      } else {
        asteroid.getAsteroidLabel().clearAlliance();
      }
    }
  };

  /* --------------------------------- SYSTEMS -------------------------------- */
  // run callback when an asteroid becomes visible if it possesses one
  const sub = starmapScene.objects.asteroid.onObjectVisible((entity) => {
    if (deferredStarmapContainer?.hasOnEventOnce(entity as Entity))
      deferredStarmapContainer.runOnEventOnce(entity as Entity);
  });

  // this is probably cheaper than figuring out which part of the label must be changed exactly;
  // if a non-visible asteroid is going through a lot of updates, it will store the callback only the first time, then do nothing until
  // it comes in sight and gets ran
  const registerCallback = (entity: Entity) => {
    if (deferredStarmapContainer?.hasOnEventOnce(entity)) return;

    deferredStarmapContainer?.addOnEventOnce(entity, () => {
      const ownerEntity = (components.OwnedBy.get(entity)?.value as Entity | undefined) ?? singletonEntity;
      const expansionLevel = components.ShardAsteroid.get(entity)
        ? undefined
        : components.Level.get(entity)?.value ?? 1n;
      const ownerAllianceEntity = components.PlayerAlliance.get(ownerEntity)?.alliance as Entity | undefined;

      updateAsteroidLabel(starmapScene, entity, ownerEntity, expansionLevel, ownerAllianceEntity);
    });
  };

  // bail out if it's not an asteroid or register callbacks if it's inactive in both scenes
  // return the scenes in which it's active (so should be updated)
  const _update = (entity: Entity) => {
    // systems will run for other types of entity as well, so we need to filter out asteroids
    if (!components.Asteroid.has(entity) && !components.ShardAsteroid.has(entity)) return undefined;
    const scenesToUpdate = scenes.filter((scene) => scene.objects.asteroid.get(entity)?.active);
    // if the asteroid is not active in the command center scene, it means that it doesn't exist so it'll be freshly rendered
    if (!scenesToUpdate.includes(starmapScene)) registerCallback(entity);

    return scenesToUpdate.length > 0 ? scenesToUpdate : undefined;
  };

  /* ---------------------------------- OWNER --------------------------------- */
  defineComponentSystem(systemsWorld, components.OwnedBy, ({ entity, value: [current] }) => {
    const scenesToUpdate = _update(entity);
    if (!scenesToUpdate) return;

    const ownerEntity = (current?.value as Entity | undefined) ?? singletonEntity;
    // we also need to update the alliance label if the owner is in an alliance
    const ownerAllianceEntity = components.PlayerAlliance.get(ownerEntity)?.alliance as Entity | undefined;

    scenesToUpdate.forEach((scene) => {
      updateAsteroidLabel(scene, entity, ownerEntity, undefined, ownerAllianceEntity ?? singletonEntity);
    });
  });

  /* ---------------------------------- LEVEL --------------------------------- */
  defineComponentSystem(systemsWorld, components.Level, ({ entity, value: [current] }) => {
    const scenesToUpdate = _update(entity);
    if (!scenesToUpdate) return;
    // we don't want to set a level label on shards
    if (components.ShardAsteroid.has(entity)) return;

    scenesToUpdate.forEach((scene) => {
      updateAsteroidLabel(scene, entity, undefined, current?.value);
    });
  });

  /* ----------------------------- OWNER ALLIANCE ----------------------------- */
  // react to changes in alliance membership (but will miss creating an alliance as `Alliance` gets synced slightly after `PlayerAlliance`;
  // but this case is handled in the below system)
  defineComponentSystem(systemsWorld, components.PlayerAlliance, ({ entity, value: [current] }) => {
    const ownedAsteroids = components.OwnedBy.getAllWith({ value: entity });

    for (const asteroid of ownedAsteroids) {
      const scenesToUpdate = _update(asteroid);
      if (!scenesToUpdate) continue;

      const allianceEntity = (current?.alliance as Entity | undefined) ?? singletonEntity;
      scenesToUpdate.forEach((scene) => {
        updateAsteroidLabel(scene, asteroid, undefined, undefined, allianceEntity);
      });
    }
  });

  // react to changes in alliance name, and will also handle a new alliance
  // TODO(review): this is quite expensive, should we react to changes in alliance name? knowing that this would be updated
  // on visibility change, this is only for the live updates to currently visible asteroids
  defineComponentSystem(systemsWorld, components.Alliance, ({ entity, value: [current] }) => {
    if (!current) return;

    const allianceMembers = components.PlayerAlliance.getAllWith({ alliance: entity });
    const allianceAsteroids = allianceMembers.map((member) => components.OwnedBy.getAllWith({ value: member })).flat();

    for (const asteroid of allianceAsteroids) {
      const scenesToUpdate = _update(asteroid);
      if (!scenesToUpdate) continue;

      scenesToUpdate.forEach((scene) => {
        updateAsteroidLabel(scene, asteroid, undefined, undefined, entity, current?.name);
      });
    }
  });

  systemsWorld.registerDisposer(sub);
};
