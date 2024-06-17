import { Coord } from "@primodiumxyz/engine/types";
import { Entity } from "@primodiumxyz/reactive-tables";
import { entityToRockName, Tables } from "@primodiumxyz/core";

import { PrimodiumScene } from "@/types";
import { ShardAsteroid } from "@/lib/objects/asteroid/ShardAsteroid";

export const renderShardAsteroid = (args: {
  scene: PrimodiumScene;
  entity: Entity;
  coord?: Coord;
  addEventHandlers?: boolean;
  tables: Tables;
}) => {
  const { scene, entity, coord = { x: 0, y: 0 }, addEventHandlers = false, tables } = args;
  //TODO: replace with hanks fancy api stuff
  const asteroidData = tables.ShardAsteroid.get(entity);
  if (!asteroidData) throw new Error("Shard asteroid data not found");

  const asteroid = new ShardAsteroid({ id: entity, scene, coord });

  asteroid.getAsteroidLabel().setProperties({
    nameLabel: entityToRockName(entity),
  });

  if (!addEventHandlers) return asteroid;

  asteroid
    .onClick(() => {
      const sequence = [
        {
          at: 0,
          run: () => scene.camera.pan(asteroid.getCoord(), { duration: 300 }),
        },
        {
          at: 300,
          run: () => scene.camera.zoomTo(scene.config.camera.maxZoom, 500),
        },
      ];
      //set the selected rock immediately if we are sufficiently zoomed in
      if (scene.camera.phaserCamera.zoom >= scene.config.camera.maxZoom * 0.5)
        tables.SelectedRock.set({ value: entity });
      else sequence.push({ at: 800, run: () => tables.SelectedRock.set({ value: entity }) });

      scene.phaserScene.add.timeline(sequence).play();

      //set the selected rock immediately if we are sufficiently zoomed in
      if (scene.camera.phaserCamera.zoom >= scene.config.camera.maxZoom * 0.5)
        tables.SelectedRock.set({ value: entity });
    })
    .onHoverEnter(() => {
      tables.HoverEntity.set({ value: entity });
    })
    .onHoverExit(() => {
      tables.HoverEntity.remove();
    });

  return asteroid;
};
