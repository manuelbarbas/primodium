import {
  Has,
  defineEnterSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";

import { world } from "src/network/world";

import { Position } from "src/network/components/chainComponents";
import { createCameraApi } from "src/game/api/camera";
import { ActiveAsteroid } from "src/network/components/clientComponents";

export const focusAsteroid = (scene: Scene) => {
  const { pan } = createCameraApi(scene);
  const gameWorld = namespaceWorld(world, "game");

  const query = [Has(ActiveAsteroid)];

  const handleMove = async () => {
    // sleep 100 ms to properly pan
    await new Promise((resolve) => setTimeout(resolve, 100));

    const activeAsteroid = ActiveAsteroid.get()?.value;

    if (!activeAsteroid) return;

    const coord = Position.get(activeAsteroid);
    if (!coord) return;

    pan(coord);
  };

  defineEnterSystem(gameWorld, query, handleMove);

  defineUpdateSystem(gameWorld, query, handleMove);
};
