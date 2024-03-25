import { Entity, Has, Not, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { toast } from "react-toastify";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getCanAttack, getCanSend } from "src/util/unit";
import { initializeSecondaryAsteroids } from "./utils/initializeSecondaryAsteroids";
import { PrimaryAsteroid, SecondaryAsteroid } from "src/game/lib/objects/Asteroid";
import { EntityType, MapIdToAsteroidType } from "src/util/constants";
import { createCameraApi } from "src/game/api/camera";
import { StaticObjectManager } from "src/game/lib/utils/StaticObjectManager";

export const renderAsteroid = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const cameraApi = createCameraApi(scene);

  const objectManager = new StaticObjectManager(scene, scene.tiled.tileHeight * 32);
  const render = (entity: Entity, coord: Coord) => {
    const asteroidData = components.Asteroid.get(entity);
    if (!asteroidData) throw new Error("Asteroid data not found");

    const expansionLevel = components.Level.get(entity)?.value ?? 1n;

    const spriteScale = 0.34 + 0.05 * Number(asteroidData.maxLevel);
    let asteroid: PrimaryAsteroid | SecondaryAsteroid;
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
          if (getCanAttack(attackOrigin, entity)) components.Attack.setDestination(entity);
          else toast.error("Cannot attack this asteroid.");
        } else if (sendOrigin) {
          if (getCanSend(sendOrigin, entity)) components.Send.setDestination(entity);
          else toast.error("Cannot send to this asteroid.");
        } else {
          components.SelectedRock.set({ value: entity });
          cameraApi.pan(coord, 500);
          cameraApi.zoomTo(1.5, 500);
        }
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        components.HoverEntity.set({ value: entity });
        scene.phaserScene.tweens.add({
          targets: asteroid,
          scale: 1.2,
          duration: 100,
        });
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        components.HoverEntity.remove();
        scene.phaserScene.tweens.add({
          targets: asteroid,
          scale: spriteScale,
          duration: 100,
        });
      });

    objectManager.add(entity, asteroid);
  };

  const query = [Has(components.Asteroid), Has(components.Position), Not(components.PirateAsteroid)];

  defineEnterSystem(systemsWorld, query, async ({ entity }) => {
    const coord = components.Position.get(entity);
    const asteroidData = components.Asteroid.get(entity);

    if (!coord) return;

    //TODO: not sure why this is needed but rendering of unitialized asteroids wont work otherwise
    await new Promise((resolve) => setTimeout(resolve, 0));

    render(entity, coord);
    if (asteroidData?.spawnsSecondary) initializeSecondaryAsteroids(entity, coord);
  });

  systemsWorld.registerDisposer(() => {
    objectManager.dispose();
  });
};
