import { Entity, Has, defineEnterSystem, defineUpdateSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";

import { createCameraApi } from "src/game/api/camera";
import { components } from "src/network/components";
import { world } from "src/network/world";

export const focusMainbase = (scene: Scene) => {
  const { pan } = createCameraApi(scene);
  const gameWorld = namespaceWorld(world, "game");

  const query = [Has(components.Home)];

  const handleMove = ({ entity }: { entity: Entity }) => {
    const playerEntity = components.Account.get()?.value;
    if (entity !== playerEntity) return;

    //TODO - fix converting to entity
    const mainBase = components.Home.get(playerEntity)?.mainBase as Entity | undefined;

    if (!mainBase) return;

    const mainBaseCoord = components.Position.get(mainBase);
    if (!mainBaseCoord) return;
    pan(mainBaseCoord, 0);
  };

  defineEnterSystem(gameWorld, query, handleMove);

  defineUpdateSystem(gameWorld, query, handleMove);
};
