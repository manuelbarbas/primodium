import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { BaseAsteroid } from "src/game/lib/objects/Asteroid/BaseAsteroid";
import { Fleet } from "src/game/lib/objects/Fleet";
import { createAudioApi } from "src/game/api/audio";
import { AudioKeys } from "src/game/lib/constants/assets/audio";
export const renderFleetsInOrbit = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const audioApi = createAudioApi(scene);

  // handle rendering fleets if asteroid is not yet spawned
  const spawnQueue = new Map<Entity, Entity[]>();
  const unsub = scene.objects.onNewChild((id) => {
    const asteroidEntity = id as Entity;
    //does fleets exist in spawn queue
    const fleets = spawnQueue.get(asteroidEntity);

    if (fleets) {
      fleets.forEach((entity) => {
        renderOrbitingFleet(entity, asteroidEntity);
      });
      spawnQueue.delete(asteroidEntity);
    }
  });

  const renderOrbitingFleet = (entity: Entity, asteroidEntity: Entity) => {
    const asteroid = scene.objects.get(asteroidEntity);

    // if asteroid is not yet spawned, add entity to spawn queue
    if (!asteroid) {
      const queue = spawnQueue.get(asteroidEntity) ?? [];
      if (queue.length) queue.push(entity);
      else spawnQueue.set(asteroidEntity, [entity]);
      return;
    }

    if (!(asteroid instanceof BaseAsteroid)) return;

    // add fleet to asteroid's orbit
    const fleet = new Fleet(scene, { x: 0, y: 0 })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        components.SelectedFleet.set({
          value: entity,
        });
        audioApi.play(AudioKeys.Bleep, "ui");
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        components.HoverEntity.set({
          value: entity,
        });
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        components.HoverEntity.remove();
      });
    asteroid.getOrbitRing().addFleet(fleet);
    scene.objects.add(entity, fleet);
  };

  defineComponentSystem(systemsWorld, components.FleetMovement, async (update) => {
    const newMovement = update.value[0];
    const oldMovement = update.value[1];

    if (newMovement) {
      const time = components.Time.get()?.value ?? 0n;
      const arrivalTime = newMovement.arrivalTime ?? 0n;
      if (arrivalTime <= time) {
        renderOrbitingFleet(update.entity, newMovement.destination as Entity);
      }
    }
    if (oldMovement) renderOrbitingFleet(update.entity, oldMovement.destination as Entity);
  });

  defineComponentSystem(systemsWorld, components.SelectedFleet, ({ value }) => {
    if (value[1]) {
      const fleet = components.FleetMovement.get(value[1].value);

      if (!fleet) return;

      const asteroid = scene.objects.get(fleet.destination);

      if (asteroid instanceof BaseAsteroid) {
        asteroid.getOrbitRing().resumeRotation();
      }
    }

    if (value[0]) {
      components.SelectedRock.remove();
      const fleet = components.FleetMovement.get(value[0].value);

      if (!fleet) return;

      const asteroid = scene.objects.get(fleet.destination);

      if (asteroid instanceof BaseAsteroid) {
        asteroid.getOrbitRing().pauseRotation();
      }
    }
  });

  defineComponentSystem(systemsWorld, components.SelectedRock, ({ value }) => {
    if (value[0]) {
      const asteroid = scene.objects.get(value[0].value);

      if (asteroid instanceof BaseAsteroid) {
        asteroid.getOrbitRing().pauseRotation();
      }

      components.SelectedFleet.remove();
      if (components.Attack.get()?.originFleet) return;
      if (components.Send.get()?.originFleet) return;
      components.Attack.reset();
      components.Send.reset();
    }

    if (value[1]) {
      const asteroid = scene.objects.get(value[1].value);

      if (asteroid instanceof BaseAsteroid) {
        asteroid.getOrbitRing().resumeRotation();
      }
    }
  });

  systemsWorld.registerDisposer(() => {
    unsub();
  });
};
