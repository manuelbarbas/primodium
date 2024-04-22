import { defineEnterSystem, defineUpdateSystem, Entity, Has, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { toast } from "react-toastify";
import { createCameraApi } from "src/game/api/camera";
import { createObjectApi } from "src/game/api/objects";
import { ShardAsteroid } from "src/game/lib/objects/Asteroid/ShardAsteroid";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getCanAttack, getCanSend } from "src/util/unit";

export const renderShardAsteroid = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const cameraApi = createCameraApi(scene);
  const objects = createObjectApi(scene);

  const renderNewAsteroid = (entity: Entity, coord: Coord) => {
    const asteroidData = components.ShardAsteroid.get(entity);
    if (!asteroidData) throw new Error("Shard asteroid data not found");

    const spriteScale = 0.75;
    const asteroid = new ShardAsteroid(scene, entity, coord).setScale(spriteScale);
    getSecondaryOutlineSprite(relationship, 1n);

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
          cameraApi.pan(coord, { duration: 500 });
          cameraApi.zoomTo(1.5, 500);
        }
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        components.HoverEntity.set({ value: entity });
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        components.HoverEntity.remove();
      });

    scene.objects.add(entity, asteroid, true);
  };

  const renderExplodeAndMoveAsteroid = (entity: Entity, coord: Coord) => {
    // explode

    const asteroid = objects.getAsteroid(entity);
    if (!asteroid) return;

    asteroid.getOrbitRing().clear();
    asteroid.setTilePosition(coord);

    // this is necessary because the asteroid's position changes so the pan breaks
    asteroid.off(Phaser.Input.Events.GAMEOBJECT_POINTER_UP);
    asteroid.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
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
        cameraApi.pan(coord, { duration: 500 });
        cameraApi.zoomTo(1.5, 500);
      }
    });
  };

  const query = [Has(components.ShardAsteroid), Has(components.Position)];

  defineEnterSystem(systemsWorld, query, async ({ entity }) => {
    const coord = components.Position.get(entity);

    if (!coord) return;

    renderNewAsteroid(entity, coord);
  });

  defineUpdateSystem(systemsWorld, query, async ({ entity, component }) => {
    if (component.id !== components.Position.id) return;
    const coord = components.Position.get(entity);

    if (!coord) return;

    renderExplodeAndMoveAsteroid(entity, coord);
  });
};
