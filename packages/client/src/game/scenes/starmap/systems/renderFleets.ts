import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { PrimodiumScene } from "@/game/api/scene";
import { BaseAsteroid } from "@game/lib/objects/Asteroid/BaseAsteroid";
import { TransitLine } from "@game/lib/objects/TransitLine";
import { components } from "@/network/components";
import { world } from "@/network/world";
import { renderFleet } from "@/game/lib/render/renderFleet";

export const renderFleets = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const transitsToUpdate = new Set<Entity>();

  // handle rendering fleets if asteroid is not yet spawned
  const spawnQueue = new Map<Entity, Entity[]>();
  const unsub = scene.objects.fleet.onNewObject((id) => {
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
    const originPixelPosition = scene.utils.tileCoordToPixelCoord({ x: originPosition.x, y: -originPosition.y });
    const destinationPixelPosition = scene.utils.tileCoordToPixelCoord({
      x: destinationPosition.x,
      y: -destinationPosition.y,
    });

    const fleetObject = getFleetObject(fleet);

    const transitLine = getTransitLineObject(fleet);
    transitLine.setFleet(fleetObject);
    transitLine.setCoordinates(originPixelPosition, destinationPixelPosition);
    transitsToUpdate.add(fleet);

    //update the view of the container when fleet moves away from origin. This can mean removing the orbit ring render or updating the inline layout
    const originAsteroid = scene.objects.asteroid.get(origin as Entity);
    originAsteroid?.getFleetContainer().updateView();
  }

  function handleFleetOrbit(fleet: Entity, asteroidEntity: Entity) {
    const asteroid = scene.objects.asteroid.get(asteroidEntity);

    if (!asteroid) {
      const queue = spawnQueue.get(asteroidEntity) ?? [];
      if (queue.length) queue.push(fleet);
      else spawnQueue.set(asteroidEntity, [fleet]);
      return;
    }

    if (!(asteroid instanceof BaseAsteroid)) return;

    const fleetObject = getFleetObject(fleet);

    asteroid.getFleetContainer().addFleet(fleetObject);
  }

  function getFleetObject(entity: Entity) {
    const fleet = scene.objects.fleet.get(entity);

    if (!fleet) {
      const newFleet = renderFleet({ scene, entity });

      return newFleet;
    }

    return fleet;
  }

  function getTransitLineObject(entity: Entity) {
    const transitLine = scene.objects.transitLine.get(entity);

    if (!transitLine) {
      const newTransitLine = new TransitLine({ id: entity, scene, start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
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
      const transitLine = scene.objects.transitLine.get(update.entity);
      if (transitLine) {
        transitLine.destroy();
        transitsToUpdate.delete(update.entity);
      } else {
        const orbitRing = scene.objects.asteroid.get(oldMovement.destination as Entity)?.getFleetContainer();
        const fleet = scene.objects.fleet.get(update.entity);
        if (fleet) orbitRing?.removeFleet(fleet);
      }
    }
  });

  //handle transits
  defineComponentSystem(systemsWorld, components.Time, ({ value }) => {
    const now = value[0]?.value ?? 0n;

    transitsToUpdate.forEach((transit) => {
      const transitObj = scene.objects.transitLine.get(transit);

      if (!transitObj) return;

      const movement = components.FleetMovement.get(transit);

      if (!movement) return;

      const timeTraveled = now - movement.sendTime;
      const totaltime = movement.arrivalTime - movement.sendTime;

      const progress = Number(timeTraveled) / Number(totaltime);

      transitObj.setFleetProgress(progress);

      if (progress >= 1) {
        const fleet = scene.objects.fleet.get(transit);
        const orbitRing = scene.objects.asteroid.get(movement.destination as Entity)?.getFleetContainer();

        if (orbitRing && fleet) {
          scene.objects.transitLine.get(transit)?.destroy(true);
          orbitRing.addFleet(fleet);
        }

        transitsToUpdate.delete(transit);
      }
    });
  });

  systemsWorld.registerDisposer(() => {
    unsub();
  });
};
