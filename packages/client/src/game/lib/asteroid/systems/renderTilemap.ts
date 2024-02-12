import { components } from "src/network/components";
import { Scene } from "engine/types";
import { MaxLevelToTilemap } from "@game/constants";
import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { world } from "src/network/world";

export const renderTilemap = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemsWorld, components.ActiveRock, ({ value }) => {
    const asteroidData = components.Asteroid.get(value[0]?.value);

    if (!asteroidData) return;

    scene.tilemap.render(MaxLevelToTilemap[Number(asteroidData.maxLevel)]);
  });
};
