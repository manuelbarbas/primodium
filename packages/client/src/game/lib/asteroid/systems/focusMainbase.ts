import { Entity, Has, defineEnterSystem, defineUpdateSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";

import { createCameraApi } from "src/game/api/camera";
import { components } from "src/network/components";
import { world } from "src/network/world";

export const focusMainbase = (scene: Scene) => {
  const { pan } = createCameraApi(scene);
  const systemsWorld = namespaceWorld(world, "systems");

  const query = [Has(components.Home)];

  const handleMove = ({ entity }: { entity: Entity }) => {
    const playerEntity = components.Account.get()?.value;
    const playerHome = components.Home.get(playerEntity)?.value as Entity | undefined;
    if (entity !== playerHome) return;

    //TODO - fix converting to entity
    const mainBase = components.Home.get(playerHome)?.value as Entity | undefined;

    if (!mainBase) return;

    const mainBaseCoord = components.Position.get(mainBase);
    if (!mainBaseCoord) return;
    pan(mainBaseCoord, 0);
  };

  defineEnterSystem(systemsWorld, query, handleMove);

  defineUpdateSystem(systemsWorld, query, handleMove);
};
