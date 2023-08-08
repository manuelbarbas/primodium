import {
  EntityIndex,
  Has,
  defineEnterSystem,
  defineUpdateSystem,
  namespaceWorld,
  EntityID,
} from "@latticexyz/recs";
import { Scene } from "engine/types";

import { world } from "src/network/world";

import { MainBase } from "src/network/components/chainComponents";
import { decodeCoordEntity } from "src/util/encode";
import { createCameraApi } from "src/game/api/camera";
import {
  SelectedBuilding,
  SelectedTile,
} from "src/network/components/clientComponents";

export const focusMainbase = (scene: Scene, player: EntityID) => {
  const { pan } = createCameraApi(scene);
  const gameWorld = namespaceWorld(world, "game");

  const query = [Has(MainBase)];

  const handleMove = ({ entity }: { entity: EntityIndex }) => {
    const entityId = world.entities[entity];
    if (entityId !== player) return;

    const mainBase = MainBase.get(player)?.value;

    if (!mainBase) return;

    const mainBaseCoord = decodeCoordEntity(mainBase);

    pan(mainBaseCoord);
    SelectedBuilding.set({ value: mainBase });
    SelectedTile.remove();
  };

  defineEnterSystem(gameWorld, query, handleMove);

  defineUpdateSystem(gameWorld, query, handleMove);
};
