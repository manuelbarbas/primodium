import { namespaceWorld, defineComponentSystem, Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { renderFleet } from "@/game/lib/render/renderFleet";
import { PrimodiumScene } from "@/game/api/scene";
import { renderShardAsteroid } from "@/game/lib/render/renderShardAsteroid";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { isAsteroidBlocked } from "@/util/asteroid";
import { getOrbitingFleets } from "@/util/unit";
import { StanceToIcon } from "@/game/lib/mappings";
import { EFleetStance } from "contracts/config/enums";
import { renderAsteroid } from "@/game/lib/render/renderAsteroid";

export const renderOverview = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");
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
    }

    if (!entity) return;

    const asteroid = components.ShardAsteroid.has(entity)
      ? renderShardAsteroid({ scene, entity })
      : renderAsteroid({ scene, entity });

    asteroid?.onClick(() => {
      components.BattleTarget.set({
        value: entity,
      });
    }, true);

    for (const fleet of getOrbitingFleets(entity)) {
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
};
