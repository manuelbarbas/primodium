import { components } from "src/network/components";
import { Scene } from "engine/types";
import { MaxLevelToTilemap } from "@game/constants";
import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { world } from "src/network/world";

export const renderTilemap = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemsWorld, components.ActiveRock, ({ value }) => {
    const activeRock = value[0]?.value as Entity;

    if (!activeRock) return;

    const asteroidData = components.Asteroid.get(activeRock);

    if (!asteroidData) return;

    console.log(asteroidData);

    //render tilemap
    scene.tilemap.render(MaxLevelToTilemap[Number(asteroidData.maxLevel)]);
  });

  defineComponentSystem(systemsWorld, components.SelectedRock, ({ value }) => {
    console.log(components.Asteroid.get(value[0]?.value as Entity));
  });
};
