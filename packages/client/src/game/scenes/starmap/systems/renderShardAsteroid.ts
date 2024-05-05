import { entityToRockName } from "@/util/name";
import { defineEnterSystem, defineUpdateSystem, Entity, Has, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { createCameraApi } from "src/game/api/camera";
import { createObjectApi } from "src/game/api/objects";
import { ShardAsteroid } from "src/game/lib/objects/Asteroid/ShardAsteroid";
import { components } from "src/network/components";
import { world } from "src/network/world";

export const renderShardAsteroid = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const cameraApi = createCameraApi(scene);
  const objects = createObjectApi(scene);

  const renderNewAsteroid = (entity: Entity, coord: Coord) => {
    const asteroidData = components.ShardAsteroid.get(entity);
    if (!asteroidData) throw new Error("Shard asteroid data not found");

    const spriteScale = 0.4;
    const asteroid = new ShardAsteroid(scene, coord).setScale(spriteScale);

    asteroid
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        const sequence = [
          {
            at: 0,
            run: () => cameraApi.pan(asteroid.getCoord(), { duration: 300 }),
          },
          {
            at: 300,
            run: () => cameraApi.zoomTo(scene.config.camera.maxZoom, 500),
          },
        ];
        //set the selected rock immediately if we are sufficiently zoomed in
        if (scene.camera.phaserCamera.zoom >= scene.config.camera.maxZoom * 0.5)
          components.SelectedRock.set({ value: entity });
        else sequence.push({ at: 800, run: () => components.SelectedRock.set({ value: entity }) });

        scene.phaserScene.add.timeline(sequence).play();

        //set the selected rock immediately if we are sufficiently zoomed in
        if (scene.camera.phaserCamera.zoom >= scene.config.camera.maxZoom * 0.5)
          components.SelectedRock.set({ value: entity });
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        components.HoverEntity.set({ value: entity });
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        components.HoverEntity.remove();
      });

    asteroid.getAsteroidLabel().setProperties({
      nameLabel: entityToRockName(entity),
    });

    scene.objects.add(entity, asteroid, false);
  };

  const renderExplodeAndMoveAsteroid = (entity: Entity, coord: Coord) => {
    // TODO: explode

    const asteroid = objects.getAsteroid(entity);
    if (!asteroid) return;

    asteroid.getOrbitRing().clear();
    asteroid.setTilePosition(coord);
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
