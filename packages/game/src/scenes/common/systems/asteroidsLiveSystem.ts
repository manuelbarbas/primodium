import { Core, entityToPlayerName, entityToRockName, EntityType, getEnsName } from "@primodiumxyz/core";
import { defaultEntity, Entity, namespaceWorld } from "@primodiumxyz/reactive-tables";

import { PrimodiumScene } from "@/types";
import { MainbaseLevelToEmblem } from "@/lib/mappings";

// Setup the asteroid label updates over visible entities
// Systems will be executed inside the starmap and command center scenes
// They will fire on any change to entities only if they are visible, otherwise it will wait for it to become visible to run the update
// (meaning moving inside the starmap, or entering/exiting the command center)
export const asteroidsLiveSystem = (starmapScene: PrimodiumScene, commandCenterScene: PrimodiumScene, core: Core) => {
  const {
    tables,
    network: { world },
    config,
    utils,
  } = core;
  const systemsWorld = namespaceWorld(world, "systems");
  const scenes = [starmapScene, commandCenterScene];
  const deferredStarmapContainer = starmapScene.objects.deferredRenderContainer.getContainer(EntityType.Asteroid);

  const playerEntity = tables.Account.get()?.value;

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

    const playerHomeEntity = tables.Home.get(playerEntity)?.value as Entity | undefined;

    if (ownerEntity) {
      const isHome = playerHomeEntity === asteroidEntity;
      const ownedByPlayer = ownerEntity === playerEntity;
      const asteroidLabel = asteroid.getAsteroidLabel();

      asteroidLabel.setProperties({
        nameLabel: entityToRockName(asteroidEntity) + (isHome ? " *" : ""),
        nameLabelColor: ownedByPlayer
          ? 0xffff00
          : tables.Asteroid.get(asteroidEntity)?.spawnsSecondary
          ? 0x00ffff
          : 0xffffff,
        ownerLabel: ownedByPlayer ? "You" : ownerEntity === defaultEntity ? "unowned" : entityToPlayerName(ownerEntity),
      });

      // we want to do this after to not block the rest of the update

      if (!config.accountLinkUrl || !playerEntity) return;

      getEnsName(config.accountLinkUrl, playerEntity).then((addressObj) => {
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
      const hasAlliance = ownerAllianceEntity && ownerAllianceEntity !== defaultEntity;

      if (hasAlliance) {
        asteroid.getAsteroidLabel().setProperties({
          allianceLabel: ownerAllianceName
            ? utils.decodeAllianceName(ownerAllianceName, true)
            : utils.getAllianceName(ownerAllianceEntity, true),
          allianceLabelColor: parseInt(utils.getEntityColor(ownerAllianceEntity).slice(1), 16),
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
      const ownerEntity = (tables.OwnedBy.get(entity)?.value as Entity | undefined) ?? defaultEntity;
      const expansionLevel = tables.ShardAsteroid.get(entity) ? undefined : tables.Level.get(entity)?.value ?? 1n;
      const ownerAllianceEntity = tables.PlayerAlliance.get(ownerEntity)?.alliance as Entity | undefined;

      updateAsteroidLabel(starmapScene, entity, ownerEntity, expansionLevel, ownerAllianceEntity);
    });
  };

  // bail out if it's not an asteroid or register callbacks if it's inactive in both scenes
  // return the scenes in which it's active (so should be updated)
  const _update = (entity: Entity) => {
    // systems will run for other types of entity as well, so we need to filter out asteroids
    if (!tables.Asteroid.has(entity) && !tables.ShardAsteroid.has(entity)) return undefined;
    const scenesToUpdate = scenes.filter((scene) => scene.objects.asteroid.get(entity)?.active);
    // if the asteroid is not active in the command center scene, it means that it doesn't exist so it'll be freshly rendered
    if (!scenesToUpdate.includes(starmapScene)) registerCallback(entity);

    return scenesToUpdate.length > 0 ? scenesToUpdate : undefined;
  };

  /* ---------------------------------- OWNER --------------------------------- */
  tables.OwnedBy.watch({
    world: systemsWorld,
    onChange: ({ entity, properties: { current } }) => {
      const scenesToUpdate = _update(entity);
      if (!scenesToUpdate) return;

      const ownerEntity = (current?.value as Entity | undefined) ?? defaultEntity;
      // we also need to update the alliance label if the owner is in an alliance
      const ownerAllianceEntity = tables.PlayerAlliance.get(ownerEntity)?.alliance as Entity | undefined;

      scenesToUpdate.forEach((scene) => {
        updateAsteroidLabel(scene, entity, ownerEntity, undefined, ownerAllianceEntity ?? defaultEntity);
      });
    },
  });

  /* ---------------------------------- LEVEL --------------------------------- */
  tables.Level.watch({
    world: systemsWorld,
    onChange: ({ entity, properties: { current } }) => {
      const scenesToUpdate = _update(entity);
      if (!scenesToUpdate) return;

      // we don't want to set a level label on shards
      if (tables.ShardAsteroid.has(entity)) return;

      scenesToUpdate.forEach((scene) => {
        updateAsteroidLabel(scene, entity, undefined, current?.value);
      });
    },
  });

  /* ----------------------------- OWNER ALLIANCE ----------------------------- */
  // react to changes in alliance membership (but will miss creating an alliance as `Alliance` gets synced slightly after `PlayerAlliance`;
  // but this case is handled in the below system)
  tables.PlayerAlliance.watch({
    world: systemsWorld,
    onChange: ({ entity, properties: { current } }) => {
      const ownedAsteroids = tables.OwnedBy.getAllWith({ value: entity });

      for (const asteroid of ownedAsteroids) {
        const scenesToUpdate = _update(asteroid);
        if (!scenesToUpdate) continue;

        const allianceEntity = (current?.alliance as Entity | undefined) ?? defaultEntity;
        scenesToUpdate.forEach((scene) => {
          updateAsteroidLabel(scene, asteroid, undefined, undefined, allianceEntity);
        });
      }
    },
  });

  // react to changes in alliance name, and will also handle a new alliance
  // TODO(review): this is quite expensive, should we react to changes in alliance name? knowing that this would be updated
  // on visibility change, this is only for the live updates to currently visible asteroids
  tables.Alliance.watch({
    world: systemsWorld,
    onChange: ({ entity, properties: { current } }) => {
      if (!current) return;

      const allianceMembers = tables.PlayerAlliance.getAllWith({ alliance: entity });
      const allianceAsteroids = allianceMembers.map((member) => tables.OwnedBy.getAllWith({ value: member })).flat();

      for (const asteroid of allianceAsteroids) {
        const scenesToUpdate = _update(asteroid);
        if (!scenesToUpdate) continue;

        scenesToUpdate.forEach((scene) => {
          updateAsteroidLabel(scene, asteroid, undefined, undefined, entity, current?.name);
        });
      }
    },
  });

  systemsWorld.registerDisposer(sub);
};
