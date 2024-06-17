import { Core } from "@primodiumxyz/core";
import { defaultEntity, Entity, namespaceWorld } from "@primodiumxyz/reactive-tables";
import { EFleetStance } from "contracts/config/enums";

import { renderAsteroid } from "@/lib/render/renderAsteroid";
import { renderShardAsteroid } from "@/lib/render/renderShardAsteroid";
import { renderFleet } from "@/lib/render/renderFleet";
import { PrimodiumScene } from "@/types";
import { StanceToIcon } from "@/lib/mappings";

export const renderOverview = (scene: PrimodiumScene, core: Core) => {
  const {
    tables,
    network: { world },
    utils,
  } = core;
  const systemsWorld = namespaceWorld(world, "systems");
  const transitsToUpdate = new Set<Entity>();
  const { objects } = scene;

  //render selected rock and its fleets
  tables.SelectedRock.watch({
    world: systemsWorld,
    onChange: ({ properties: { current, prev } }) => {
      const entity = current?.value;
      const prevEntity = prev?.value;

      if (entity === prevEntity) return;

      if (prevEntity) {
        const asteroid = objects.asteroid.get(prevEntity);
        asteroid?.getFleetsContainer().clearOrbit(true);
        asteroid?.destroy();
        transitsToUpdate.clear();
      }

      if (!entity) return;

      const asteroid = tables.ShardAsteroid.has(entity)
        ? renderShardAsteroid({ scene, entity, tables })
        : renderAsteroid({ scene, entity, core });

      asteroid
        ?.onClick(() => {
          tables.BattleTarget.set({
            value: entity,
          });
        }, true)
        .onHoverEnter(() => {
          tables.HoverEntity.set({ value: entity });
        }, true)
        .onHoverExit(() => {
          tables.HoverEntity.remove();
        }, true);

      utils.getFleets(entity).forEach((fleet) => {
        if (!utils.isFleetOrbiting(fleet)) {
          transitsToUpdate.add(fleet);
          return;
        }
        const fleetObject = renderFleet({ scene, entity: fleet, tables });
        fleetObject?.onClick(() => {
          tables.BattleTarget.set({
            value: fleet,
          });
        });
        asteroid?.getFleetsContainer().addFleet(fleetObject);
      });

      // set blocked ring if fleet is in block stance
      if (utils.isAsteroidBlocked(entity)) asteroid?.getFleetsContainer().showBlockRing();
    },
  });

  //render battle target selection
  tables.BattleTarget.watch({
    world: systemsWorld,
    onChange: ({ properties: { current, prev } }) => {
      const entity = current?.value;
      const prevEntity = prev?.value;

      if (entity === prevEntity) return;

      const asteroidEntity = tables.SelectedRock.get()?.value;

      if (!asteroidEntity) return;

      const asteroidObj = objects.asteroid.get(asteroidEntity);

      if (!entity) {
        asteroidObj?.getFleetsContainer().resumeRotation();
      } else asteroidObj?.getFleetsContainer().pauseRotation();

      //set outlines
      const obj = tables.IsFleet.get(entity) ? objects.fleet.get(entity ?? defaultEntity) : entity ? asteroidObj : null;

      const prevObj = tables.IsFleet.get(prevEntity)
        ? objects.fleet.get(prevEntity ?? defaultEntity)
        : prevEntity
        ? asteroidObj
        : null;

      obj?.setOutline(0xff0000);
      prevObj?.removeOutline();
    },
  });

  //render stances
  tables.FleetStance.watch({
    world: systemsWorld,
    onChange: ({ entity, properties: { current } }) => {
      const stance = current?.stance;

      const asteroid = tables.FleetMovement.get(entity)?.destination;

      const fleetObj = objects.fleet.get(entity);

      if (!fleetObj) return;

      const asteroidObj = objects.asteroid.get((asteroid ?? defaultEntity) as Entity);
      if (!stance) {
        fleetObj.hideStanceIcon(true);
        if (
          asteroidObj?.getFleetsContainer().getFleetCount() === 1 ||
          !utils.isAsteroidBlocked((asteroid as Entity) ?? defaultEntity)
        )
          asteroidObj?.getFleetsContainer().hideBlockRing(true);
        return;
      }

      fleetObj.setStanceIcon(StanceToIcon[stance as EFleetStance], true, true);

      if (stance === EFleetStance.Block) asteroidObj?.getFleetsContainer().showBlockRing(true);
    },
  });

  //update orbiting fleets
  tables.FleetMovement.watch({
    world: systemsWorld,
    onChange: ({ entity, properties: { current: newMovement, prev: oldMovement } }) => {
      const selectedRock = tables.SelectedRock.get()?.value;

      if (selectedRock !== newMovement?.destination && selectedRock !== oldMovement?.destination) return;

      if (newMovement && newMovement.destination === selectedRock) {
        const time = tables.Time.get()?.value ?? 0n;
        const arrivalTime = newMovement.arrivalTime ?? 0n;
        if (arrivalTime <= time) {
          const orbitRing = scene.objects.asteroid.get(selectedRock)?.getFleetsContainer();
          const fleetObj =
            scene.objects.fleet.get(entity) ??
            renderFleet({ scene, entity, tables }).onClick(() => {
              tables.BattleTarget.set({
                value: entity,
              });
            });

          orbitRing?.addFleet(fleetObj);
        } else {
          transitsToUpdate.add(entity);
        }
      } else if (oldMovement && oldMovement.destination === selectedRock) {
        //delete if we are keeping track of fleet in transit
        transitsToUpdate.delete(entity);

        const orbitRing = scene.objects.asteroid.get(oldMovement.destination as Entity)?.getFleetsContainer();
        const fleet = scene.objects.fleet.get(entity);
        if (fleet) {
          orbitRing?.removeFleet(fleet);
          fleet.destroy(true);
        }
      }
    },
  });

  //handle fleets in transit
  tables.Time.watch({
    world: systemsWorld,
    onChange: ({ properties: { current } }) => {
      const now = current?.value ?? 0n;

      transitsToUpdate.forEach((transit) => {
        const movement = tables.FleetMovement.get(transit);
        if (!movement) return;

        const timeTraveled = now - movement.sendTime;
        const totaltime = movement.arrivalTime - movement.sendTime;

        const progress = Number(timeTraveled) / Number(totaltime);

        if (progress >= 1) {
          const fleet = scene.objects.fleet.get(transit) ?? renderFleet({ scene, entity: transit, tables });
          const orbitRing = scene.objects.asteroid.get(movement.destination as Entity)?.getFleetsContainer();

          if (orbitRing && fleet) {
            orbitRing.addFleet(fleet);
          }

          transitsToUpdate.delete(transit);
        }
      });
    },
  });

  //handle fleet emtpy updates
  tables.IsFleetEmpty.watch({
    world: systemsWorld,
    onChange: ({ entity, properties: { current } }) => {
      const fleetObj = objects.fleet.get(entity);
      const isEmpty = !!current?.value;

      if (!fleetObj) return;

      if (isEmpty) fleetObj.setAlpha(0.5);
      else fleetObj.setAlpha(1);
    },
  });
};
