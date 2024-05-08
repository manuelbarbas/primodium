import { MapIdToAsteroidType } from "@/util/mappings";
import { Entity, Has, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { SceneApi } from "@/game/api/scene";
import { PrimaryAsteroid, SecondaryAsteroid } from "src/game/lib/objects/Asteroid";
import { BaseAsteroid } from "src/game/lib/objects/Asteroid/BaseAsteroid";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { EntityType } from "src/util/constants";
import { getCanAttack, getCanSend } from "src/util/unit";
import { initializeSecondaryAsteroids } from "./utils/initializeSecondaryAsteroids";

export const renderAsteroid = (scene: SceneApi) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const render = (entity: Entity, coord: Coord) => {
    const asteroidData = components.Asteroid.get(entity);
    if (!asteroidData) throw new Error("Asteroid data not found");

    const expansionLevel = components.Level.get(entity)?.value ?? 1n;

    const spriteScale = 0.34 + 0.05 * Number(asteroidData.maxLevel);
    let asteroid: BaseAsteroid;
    if (!asteroidData?.spawnsSecondary)
      asteroid = new SecondaryAsteroid(
        scene,
        coord,
        MapIdToAsteroidType[asteroidData.mapId] ?? EntityType.Kimberlite,
        asteroidData?.maxLevel
      ).setScale(spriteScale);
    else asteroid = new PrimaryAsteroid(scene, coord, expansionLevel ?? 1n, "Self").setScale(spriteScale);

    asteroid
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        const attackOrigin = components.Attack.get()?.originFleet;
        const sendOrigin = components.Send.get()?.originFleet;
        if (attackOrigin) {
          components.Attack.setDestination(entity);
          if (getCanAttack(attackOrigin, entity)) components.Attack.setDestination(entity);
          else scene.notify("error", "Cannot attack this asteroid.");
        } else if (sendOrigin) {
          if (getCanSend(sendOrigin, entity)) components.Send.setDestination(entity);
          else scene.notify("error", "Cannot send to this asteroid.");
        } else {
          components.SelectedRock.set({ value: entity });
          scene.camera.pan(coord, { duration: 500 });
          scene.camera.zoomTo(1.5, 500);
        }
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        components.HoverEntity.set({ value: entity });
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        components.HoverEntity.remove();
      });

    scene.objects.objectManager.add(entity, asteroid, true);
  };

  const query = [Has(components.Asteroid), Has(components.Position)];

  defineEnterSystem(systemsWorld, query, async ({ entity }) => {
    const coord = components.Position.get(entity);
    const asteroidData = components.Asteroid.get(entity);

    if (!coord) return;

    // //TODO: not sure why this is needed but rendering of unitialized asteroids wont work otherwise
    await new Promise((resolve) => setTimeout(resolve, 0));

    render(entity, coord);
    if (asteroidData?.spawnsSecondary) initializeSecondaryAsteroids(entity, coord);
  });
};
