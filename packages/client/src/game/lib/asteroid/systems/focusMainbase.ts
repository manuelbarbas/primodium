import { Has, defineEnterSystem, defineUpdateSystem, namespaceWorld, Entity } from "@latticexyz/recs";
import { Scene } from "engine/types";

import { world } from "src/network/world";
import { createCameraApi } from "src/game/api/camera";
import { components } from "src/network/components";
import { SetupResult } from "src/network/types";

export const focusMainbase = (scene: Scene, { network: { playerEntity } }: SetupResult) => {
  const { pan } = createCameraApi(scene);
  const gameWorld = namespaceWorld(world, "game");

  const query = [Has(components.Home)];

  const handleMove = ({ entity }: { entity: Entity }) => {
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
