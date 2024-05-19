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
// Systems will be registered (and discarded on mode change) inside the starmap and command center scenes
// They will fire on any change to entities only if they are visible, otherwise it will wait for it to become visible to run the update
// (meaning moving inside the starmap, or entering/exiting the command center)
export const asteroidsLiveSystem = (starmapScene: PrimodiumScene, commandCenterScene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const modeWorld = namespaceWorld(world, "live:mode");

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
  // register a global system that will discard old systems and register new ones for the current scene
  defineComponentSystem(systemsWorld, components.SelectedMode, ({ value: [current] }) => {
    world.dispose("live:mode");

    const mode = current?.value;
    if (mode !== Mode.Starmap && mode !== Mode.CommandCenter) return;
    const scene = current?.value === Mode.Starmap ? starmapScene : commandCenterScene;
    const deferredContainer = scene.objects.deferredRenderContainer.getContainer(EntityType.Asteroid);

    const isActive = (entity: Entity) => scene.objects.asteroid.get(entity)?.active;

    // this is probably cheaper than figuring out which part of the label must be changed exactly;
    // if a non-visible asteroid is going through a lot of updates, it will store the callback only the first time, then do nothing until
    // it comes in sight and gets ran
    const registerCallback = (entity: Entity) => {
      if (deferredContainer?.hasOnEventOnce(entity)) return;

      deferredContainer?.addOnEventOnce(entity, () => {
        const ownerEntity = (components.OwnedBy.get(entity)?.value as Entity | undefined) ?? singletonEntity;
        const expansionLevel = components.ShardAsteroid.get(entity)
          ? undefined
          : components.Level.get(entity)?.value ?? 1n;
        const ownerAllianceEntity = components.PlayerAlliance.get(ownerEntity)?.alliance as Entity | undefined;

        updateAsteroidLabel(scene, entity, ownerEntity, expansionLevel, ownerAllianceEntity);
      });
    };

    /* ------------------------------- VISIBILITY ------------------------------- */
    // run callback when an asteroid becomes visible if it possesses one
    const sub = scene.objects.asteroid.onObjectVisible((entity) => {
      if (deferredContainer?.hasOnEventOnce(entity as Entity)) deferredContainer?.runOnEventOnce(entity as Entity);
    });

    /* ---------------------------------- OWNER --------------------------------- */
    defineComponentSystem(modeWorld, components.OwnedBy, ({ entity, value: [current] }) => {
      if (!isActive(entity)) {
        registerCallback(entity);
        return;
      }

      const ownerEntity = (current?.value as Entity | undefined) ?? singletonEntity;
      // we also need to update the alliance label if the owner is in an alliance
      const ownerAllianceEntity = components.PlayerAlliance.get(ownerEntity)?.alliance as Entity | undefined;
      updateAsteroidLabel(scene, entity, ownerEntity, undefined, ownerAllianceEntity ?? singletonEntity);
    });

    /* ---------------------------------- LEVEL --------------------------------- */
    defineComponentSystem(modeWorld, components.Level, ({ entity, value: [current] }) => {
      // we don't want to set a level label on shards
      if (components.ShardAsteroid.has(entity)) return;
      if (!isActive(entity)) {
        registerCallback(entity);
        return;
      }

      updateAsteroidLabel(scene, entity, undefined, current?.value);
    });

    /* ----------------------------- OWNER ALLIANCE ----------------------------- */
    // react to changes in alliance membership (but will miss creating an alliance as `Alliance` gets synced slightly after `PlayerAlliance`;
    // but this case is handled in the below system)
    defineComponentSystem(modeWorld, components.PlayerAlliance, ({ entity, value: [current] }) => {
      const ownedAsteroids = components.OwnedBy.getAllWith({ value: entity });
      const visibleAsteroids = ownedAsteroids.filter((asteroid) => {
        if (!isActive(asteroid)) {
          registerCallback(asteroid);
          return false;
        }

        return true;
      });

      for (const asteroid of visibleAsteroids) {
        const allianceEntity = (current?.alliance as Entity | undefined) ?? singletonEntity;
        updateAsteroidLabel(scene, asteroid, undefined, undefined, allianceEntity);
      }
    });

    // react to changes in alliance name, and will also handle a new alliance
    // TODO(review): this is quite expensive, should we react to changes in alliance name? knowing that this would be updated
    // on visibility change, this is only for the live updates to currently visible asteroids
    defineComponentSystem(modeWorld, components.Alliance, ({ entity, value: [current] }) => {
      if (!current) return;

      const allianceMembers = components.PlayerAlliance.getAllWith({ alliance: entity });
      const allianceAsteroids = allianceMembers
        .map((member) => components.OwnedBy.getAllWith({ value: member }))
        .flat()
        .filter((asteroid) => {
          if (!isActive(asteroid)) {
            registerCallback(asteroid);
            return false;
          }

          return true;
        });

      for (const asteroid of allianceAsteroids) {
        updateAsteroidLabel(scene, asteroid, undefined, undefined, entity, current?.name);
      }
    });

    systemsWorld.registerDisposer(sub);
  });

  systemsWorld.registerDisposer(() => {
    world.dispose("live:mode");
  });
};
