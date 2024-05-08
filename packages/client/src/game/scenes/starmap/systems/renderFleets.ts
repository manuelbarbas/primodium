import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { SceneApi } from "@/game/api/scene";
import { BaseAsteroid } from "@game/lib/objects/Asteroid/BaseAsteroid";
import { Fleet } from "@game/lib/objects/Fleet";
import { TransitLine } from "@game/lib/objects/TransitLine";
import { components } from "@/network/components";
import { world } from "@/network/world";

export const renderFleets = (scene: SceneApi) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const transitsToUpdate = new Set<Entity>();

  // handle rendering fleets if asteroid is not yet spawned
  const spawnQueue = new Map<Entity, Entity[]>();
  const unsub = scene.objects.objectManager.onNewObject((id) => {
    const asteroidEntity = id as Entity;
    //does fleets exist in spawn queue
    const fleets = spawnQueue.get(asteroidEntity);

    if (fleets) {
      fleets.forEach((entity) => {
        handleFleetOrbit(entity, asteroidEntity);
      });
      spawnQueue.delete(asteroidEntity);
    }
  });

  function handleFleetTransit(fleet: Entity, origin: Entity, destination: Entity) {
    const originPosition = components.Position.get(origin) ?? { x: 0, y: 0 };
    const destinationPosition = components.Position.get(destination) ?? { x: 0, y: 0 };
    const originPixelPosition = tileCoordToPixelCoord(
      { x: originPosition.x, y: -originPosition.y },
      scene.tiled.tileWidth,
      scene.tiled.tileHeight
    );
    const destinationPixelPosition = tileCoordToPixelCoord(
      { x: destinationPosition.x, y: -destinationPosition.y },
      scene.tiled.tileWidth,
      scene.tiled.tileHeight
    );

    const fleetObject = getFleetObject(fleet);

    transitsToUpdate.add(fleet);
    const transitLine = getTransitLineObject(fleet);
    transitLine.setFleet(fleetObject);
    transitLine.setCoordinates(originPixelPosition, destinationPixelPosition);
  }

  function handleFleetOrbit(fleet: Entity, asteroidEntity: Entity) {
    const asteroid = scene.objects.getAsteroid(asteroidEntity);

    if (!asteroid) {
      const queue = spawnQueue.get(asteroidEntity) ?? [];
      if (queue.length) queue.push(fleet);
      else spawnQueue.set(asteroidEntity, [fleet]);
      return;
    }

    if (!(asteroid instanceof BaseAsteroid)) return;

    const fleetObject = getFleetObject(fleet);

    asteroid.getOrbitRing().addFleet(fleetObject);
  }

  function getFleetObject(entity: Entity) {
    const fleet = scene.objects.getFleet(entity);

    if (!fleet) {
      const newFleet = new Fleet(scene, { x: 0, y: 0 })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
          components.SelectedFleet.set({
            value: entity,
          });
          scene.audio.play("Bleep", "ui");
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
          components.HoverEntity.set({
            value: entity,
          });
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
          components.HoverEntity.remove();
        });
      scene.objects.objectManager.add(entity, newFleet);
      return newFleet;
    }

    return fleet;
  }

  function getTransitLineObject(entity: Entity) {
    const transitLine = scene.objects.getTransitLine(entity);

    if (!transitLine) {
      const newTransitLine = new TransitLine(scene, { x: 0, y: 0 }, { x: 0, y: 0 }).spawn();
      scene.objects.objectManager.add(`transit_${entity}`, newTransitLine);
      return newTransitLine;
    }

    return transitLine;
  }

  defineComponentSystem(systemsWorld, components.FleetMovement, async (update) => {
    const [newMovement, oldMovement] = update.value;

    if (newMovement) {
      const time = components.Time.get()?.value ?? 0n;
      const arrivalTime = newMovement.arrivalTime ?? 0n;
      if (arrivalTime <= time) {
        handleFleetOrbit(update.entity, newMovement.destination as Entity);
      } else {
        handleFleetTransit(update.entity, newMovement.origin as Entity, newMovement.destination as Entity);
      }
    } else if (oldMovement) {
      const transitLine = scene.objects.getTransitLine(update.entity);

      if (transitLine) {
        scene.objects.objectManager.remove(`transit_${update.entity}`);
        transitsToUpdate.delete(update.entity);
      } else {
        const orbitRing = scene.objects.getAsteroid(oldMovement.destination as Entity)?.getOrbitRing();
        const fleet = scene.objects.getFleet(update.entity);
        if (fleet) orbitRing?.removeFleet(fleet);
      }
    }
  });

  defineComponentSystem(systemsWorld, components.SelectedFleet, ({ value }) => {
    if (value[1]) {
      const fleet = components.FleetMovement.get(value[1].value);

      if (!fleet) return;

      const asteroid = scene.objects.objectManager.get(fleet.destination);

      if (asteroid instanceof BaseAsteroid) {
        asteroid.getOrbitRing().resumeRotation();
      }
    }

    if (value[0]) {
      components.SelectedRock.remove();
      const fleet = components.FleetMovement.get(value[0].value);

      if (!fleet) return;

      const asteroid = scene.objects.objectManager.get(fleet.destination);

      if (asteroid instanceof BaseAsteroid) {
        asteroid.getOrbitRing().pauseRotation();
      }
    }
  });

  defineComponentSystem(systemsWorld, components.SelectedRock, ({ value }) => {
    if (value[0]) {
      const asteroid = scene.objects.getAsteroid(value[0].value as Entity);

      if (asteroid) {
        asteroid.getOrbitRing().pauseRotation();
      }

      components.SelectedFleet.remove();
      if (components.Attack.get()?.originFleet) return;
      if (components.Send.get()?.originFleet) return;
      components.Attack.reset();
      components.Send.reset();
    }

    if (value[1]) {
      const asteroid = scene.objects.getAsteroid(value[1].value as Entity);

      if (asteroid) {
        asteroid.getOrbitRing().resumeRotation();
      }
    }
  });

  defineComponentSystem(systemsWorld, components.Time, ({ value }) => {
    const now = value[0]?.value ?? 0n;

    transitsToUpdate.forEach((transit) => {
      const transitObj = scene.objects.getTransitLine(transit);

      if (!transitObj) return;

      const movement = components.FleetMovement.get(transit);

      if (!movement) return;

      const timeTraveled = now - movement.sendTime;
      const totaltime = movement.arrivalTime - movement.sendTime;

      const progress = Number(timeTraveled) / Number(totaltime);

      transitObj.setFleetProgress(progress);

      if (progress >= 1) {
        const fleet = scene.objects.getFleet(transit);
        const orbitRing = scene.objects.getAsteroid(movement.destination as Entity)?.getOrbitRing();

        if (orbitRing && fleet) {
          orbitRing.addFleet(fleet);
          scene.objects.objectManager.remove(`transit_${transit}`);
        }

        transitsToUpdate.delete(transit);
      }
    });
  });

  systemsWorld.registerDisposer(() => {
    unsub();
  });
};
