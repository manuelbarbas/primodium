import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "@/network/components";
import { world } from "@/network/world";
import { PrimodiumScene } from "@/game/api/scene";
import { MainbaseLevelToEmblem } from "@/game/lib/mappings";
import { decodeAllianceName, getAllianceName } from "@/util/alliance";
import { entityToColor } from "@/util/color";
import { EntityType, Mode } from "@/util/constants";
import { entityToPlayerName, entityToRockName } from "@/util/name";

// Setup the asteroid label updates over visible entities
// Systems will be executed inside the starmap and command center scenes
// They will fire on any change to entities only if they are visible, otherwise it will wait for it to become visible to run the update
// (meaning moving inside the starmap, or entering/exiting the command center)
export const asteroidsLiveSystem = (starmapScene: PrimodiumScene, commandCenterScene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  let currentScene: PrimodiumScene | undefined;

  const playerEntity = components.Account.get()?.value;

  /* --------------------------------- UPDATE --------------------------------- */
  // currentScene undefined means that we're not in the starmap or command center
  const isActive = (entity: Entity) => (currentScene ? currentScene.objects.asteroid.get(entity)?.active : false);

  const updateAsteroidLabel = (
    asteroidEntity: Entity,
    ownerEntity?: Entity,
    expansionLevel?: bigint,
    ownerAllianceEntity?: Entity,
    ownerAllianceName?: string
  ) => {
    console.log("update label");
    if (!currentScene) return;
    const asteroid = currentScene.objects.asteroid.get(asteroidEntity);
    if (!asteroid) return;

    const playerHomeEntity = components.Home.get(playerEntity)?.value as Entity | undefined;

    if (ownerEntity) {
      const isHome = playerHomeEntity === asteroidEntity;
      const ownedByPlayer = ownerEntity === playerEntity;

      asteroid.getAsteroidLabel().setProperties({
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
  let sub: (() => void) | undefined;
  // update the current scene when the mode changes
  defineComponentSystem(systemsWorld, components.SelectedMode, ({ value: [current] }) => {
    if (sub) sub();
    const mode = current?.value;

    if (mode === Mode.Starmap) {
      currentScene = starmapScene;

      // run callback when an asteroid becomes visible if it possesses one
      const deferredContainer = currentScene.objects.deferredRenderContainer.getContainer(EntityType.Asteroid);
      console.log("DEFERRED CONTAINER", deferredContainer);
      sub = currentScene.objects.asteroid.onObjectVisible((entity) => {
        console.log("entity became visible", entity);
        if (entity === "0xf72936e7bdd8143a566fc978a669bc6d51f1edbd56bf97821d1ed928e26bbb97")
          console.log(deferredContainer?.hasOnEventOnce(entity as Entity));
        if (deferredContainer?.hasOnEventOnce(entity as Entity)) deferredContainer.runOnEventOnce(entity as Entity);
      });
    } else if (mode === Mode.CommandCenter) {
      currentScene = commandCenterScene;
    } else {
      currentScene = undefined;
    }
  });

  // this is probably cheaper than figuring out which part of the label must be changed exactly;
  // if a non-visible asteroid is going through a lot of updates, it will store the callback only the first time, then do nothing until
  // it comes in sight and gets ran
  const registerCallback = (entity: Entity) => {
    if (!currentScene) return;
    const deferredContainer = currentScene.objects.deferredRenderContainer.getContainer(EntityType.Asteroid);
    if (deferredContainer?.hasOnEventOnce(entity)) return;

    console.log("will need to update later");
    deferredContainer?.addOnEventOnce(entity, () => {
      console.log("updating from callback");
      const ownerEntity = (components.OwnedBy.get(entity)?.value as Entity | undefined) ?? singletonEntity;
      const expansionLevel = components.ShardAsteroid.get(entity)
        ? undefined
        : components.Level.get(entity)?.value ?? 1n;
      const ownerAllianceEntity = components.PlayerAlliance.get(ownerEntity)?.alliance as Entity | undefined;

      updateAsteroidLabel(entity, ownerEntity, expansionLevel, ownerAllianceEntity);
    });
  };

  // run before an update to figure out if it should run it, or directly register it
  const _update = (entity: Entity) => {
    // update only in starmap and command center
    if (!currentScene) return false;
    // systems will run for other types of entity as well, so we need to filter out asteroids
    if (!components.Asteroid.has(entity) && !components.ShardAsteroid.has(entity)) return false;
    // if the asteroid is not visible, register callback and skip the update
    if (!isActive(entity)) {
      registerCallback(entity);
      return false;
    }

    // otherwise, it's a visible asteroid; it can be updated directly
    return true;
  };

  /* ---------------------------------- OWNER --------------------------------- */
  defineComponentSystem(systemsWorld, components.OwnedBy, ({ entity, value: [current] }) => {
    const shouldUpdate = _update(entity);
    if (!shouldUpdate) return;

    const ownerEntity = (current?.value as Entity | undefined) ?? singletonEntity;
    // we also need to update the alliance label if the owner is in an alliance
    const ownerAllianceEntity = components.PlayerAlliance.get(ownerEntity)?.alliance as Entity | undefined;
    updateAsteroidLabel(entity, ownerEntity, undefined, ownerAllianceEntity ?? singletonEntity);
  });

  /* ---------------------------------- LEVEL --------------------------------- */
  defineComponentSystem(systemsWorld, components.Level, ({ entity, value: [current] }) => {
    // we don't want to set a level label on shards
    if (components.ShardAsteroid.has(entity)) return;
    const shouldUpdate = _update(entity);
    if (!shouldUpdate) return;

    updateAsteroidLabel(entity, undefined, current?.value);
  });

  /* ----------------------------- OWNER ALLIANCE ----------------------------- */
  // react to changes in alliance membership (but will miss creating an alliance as `Alliance` gets synced slightly after `PlayerAlliance`;
  // but this case is handled in the below system)
  defineComponentSystem(systemsWorld, components.PlayerAlliance, ({ entity, value: [current] }) => {
    const ownedAsteroids = components.OwnedBy.getAllWith({ value: entity });
    const visibleAsteroids = ownedAsteroids.filter((asteroid) => _update(asteroid));

    for (const asteroid of visibleAsteroids) {
      const allianceEntity = (current?.alliance as Entity | undefined) ?? singletonEntity;
      updateAsteroidLabel(asteroid, undefined, undefined, allianceEntity);
    }
  });

  // react to changes in alliance name, and will also handle a new alliance
  // TODO(review): this is quite expensive, should we react to changes in alliance name? knowing that this would be updated
  // on visibility change, this is only for the live updates to currently visible asteroids
  defineComponentSystem(systemsWorld, components.Alliance, ({ entity, value: [current] }) => {
    if (!current) return;

    const allianceMembers = components.PlayerAlliance.getAllWith({ alliance: entity });
    const allianceAsteroids = allianceMembers
      .map((member) => components.OwnedBy.getAllWith({ value: member }))
      .flat()
      .filter((asteroid) => _update(asteroid));

    for (const asteroid of allianceAsteroids) {
      updateAsteroidLabel(asteroid, undefined, undefined, entity, current?.name);
    }
  });
};
