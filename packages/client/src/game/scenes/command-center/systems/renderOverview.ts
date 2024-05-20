import { namespaceWorld, defineComponentSystem, Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { renderFleet } from "@/game/lib/render/renderFleet";
import { PrimodiumScene } from "@/game/api/scene";
import { renderShardAsteroid } from "@/game/lib/render/renderShardAsteroid";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { isAsteroidBlocked } from "@/util/asteroid";
import { getFleets, isFleetOrbiting } from "@/util/unit";
import { StanceToIcon } from "@/game/lib/mappings";
import { EFleetStance } from "contracts/config/enums";
import { renderAsteroid } from "@/game/lib/render/renderAsteroid";

export const renderOverview = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const transitsToUpdate = new Set<Entity>();
  const { objects } = scene;

  //render selected rock and its fleets
  defineComponentSystem(systemsWorld, components.SelectedRock, ({ value }) => {
    const entity = value[0]?.value;
    const prevEntity = value[1]?.value;

    if (entity === prevEntity) return;

    if (prevEntity) {
      const asteroid = objects.asteroid.get(prevEntity);
      asteroid?.getFleetsContainer().clearOrbit(true);
      asteroid?.destroy();
      transitsToUpdate.clear();
    }

    if (!entity) return;

    const asteroid = components.ShardAsteroid.has(entity)
      ? renderShardAsteroid({ scene, entity })
      : renderAsteroid({ scene, entity });

    asteroid
      ?.onClick(() => {
        components.BattleTarget.set({
          value: entity,
        });
      }, true)
      .onHoverEnter(() => {
        components.HoverEntity.set({ value: entity });
      }, true)
      .onHoverExit(() => {
        components.HoverEntity.remove();
      }, true);

    for (const fleet of getFleets(entity)) {
      if (!isFleetOrbiting(fleet)) {
        transitsToUpdate.add(fleet);
        return;
      }
      const fleetObject = renderFleet({ scene, entity: fleet });
      fleetObject?.onClick(() => {
        components.BattleTarget.set({
          value: fleet,
        });
      });
      asteroid?.getFleetsContainer().addFleet(fleetObject);
    }

    // set blocked ring if fleet is in block stance
    if (isAsteroidBlocked(entity)) asteroid?.getFleetsContainer().showBlockRing();

    //TODO: handle fleet orbit updates
  });

  //render battle target selection
  defineComponentSystem(systemsWorld, components.BattleTarget, ({ value }) => {
    const entity = value[0]?.value;
    const prevEntity = value[1]?.value;

    if (entity === prevEntity) return;

    const asteroidEntity = components.SelectedRock.get()?.value;

    if (!asteroidEntity) return;

    const asteroidObj = objects.asteroid.get(asteroidEntity);

    if (!entity) {
      asteroidObj?.getFleetsContainer().resumeRotation();
    } else asteroidObj?.getFleetsContainer().pauseRotation();

    //set outlines
    const obj = components.IsFleet.get(entity)?.value
      ? objects.fleet.get(entity ?? singletonEntity)
      : entity
      ? asteroidObj
      : null;

    const prevObj = components.IsFleet.get(prevEntity)?.value
      ? objects.fleet.get(prevEntity ?? singletonEntity)
      : prevEntity
      ? asteroidObj
      : null;

    obj?.setOutline(0xff0000);
    prevObj?.removeOutline();
  });

  //render stances
  defineComponentSystem(systemsWorld, components.FleetStance, async ({ entity, value }) => {
    const stance = value[0]?.stance;

    const asteroid = components.FleetMovement.get(entity)?.destination as Entity | undefined;

    const fleetObj = objects.fleet.get(entity);

    if (!fleetObj) return;

    const asteroidObj = objects.asteroid.get(asteroid ?? singletonEntity);
    if (!stance) {
      fleetObj.hideStanceIcon(true);
      if (asteroidObj?.getFleetsContainer().getFleetCount() === 1 || !isAsteroidBlocked(asteroid ?? singletonEntity))
        asteroidObj?.getFleetsContainer().hideBlockRing(true);
      return;
    }

    fleetObj.setStanceIcon(StanceToIcon[stance as EFleetStance], true, true);

    if (stance === EFleetStance.Block) asteroidObj?.getFleetsContainer().showBlockRing(true);
  });

  //update orbiting fleets
  defineComponentSystem(systemsWorld, components.FleetMovement, async (update) => {
    const [newMovement, oldMovement] = update.value;
    const selectedRock = components.SelectedRock.get()?.value;

    if (selectedRock !== newMovement?.destination && selectedRock !== oldMovement?.destination) return;

    if (newMovement && newMovement.destination === selectedRock) {
      const time = components.Time.get()?.value ?? 0n;
      const arrivalTime = newMovement.arrivalTime ?? 0n;
      if (arrivalTime <= time) {
        const orbitRing = scene.objects.asteroid.get(selectedRock)?.getFleetsContainer();
        const fleetObj = scene.objects.fleet.get(update.entity) ?? renderFleet({ scene, entity: update.entity });

        orbitRing?.addFleet(fleetObj);
      } else {
        transitsToUpdate.add(update.entity);
      }
    } else if (oldMovement && oldMovement.destination === selectedRock) {
      //delete if we are keeping track of fleet in transit
      transitsToUpdate.delete(update.entity);

      const orbitRing = scene.objects.asteroid.get(oldMovement.destination as Entity)?.getFleetsContainer();
      const fleet = scene.objects.fleet.get(update.entity);
      if (fleet) {
        orbitRing?.removeFleet(fleet);
        fleet.destroy(true);
      }
    }
  });

  //handle fleets in transit
  defineComponentSystem(systemsWorld, components.Time, ({ value }) => {
    const now = value[0]?.value ?? 0n;

    transitsToUpdate.forEach((transit) => {
      const movement = components.FleetMovement.get(transit);
      if (!movement) return;

      const timeTraveled = now - movement.sendTime;
      const totaltime = movement.arrivalTime - movement.sendTime;

      const progress = Number(timeTraveled) / Number(totaltime);

      if (progress >= 1) {
        const fleet = scene.objects.fleet.get(transit) ?? renderFleet({ scene, entity: transit });
        const orbitRing = scene.objects.asteroid.get(movement.destination as Entity)?.getFleetsContainer();

        if (orbitRing && fleet) {
          scene.objects.transitLine.get(transit)?.destroy(true);
          orbitRing.addFleet(fleet);
        }

        transitsToUpdate.delete(transit);
      }
    });
  });

  //handle fleet emtpy updates
  defineComponentSystem(systemsWorld, components.IsFleetEmpty, ({ entity, value }) => {
    const fleetObj = objects.fleet.get(entity);
    const isEmpty = !!value[0]?.value;

    if (!fleetObj) return;

    if (isEmpty) fleetObj.setAlpha(0.5);
    else fleetObj.setAlpha(1);
  });
};
