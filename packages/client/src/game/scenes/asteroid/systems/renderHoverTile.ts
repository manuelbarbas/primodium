import { Has, defineEnterSystem, defineExitSystem, defineUpdateSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { Tile } from "../../../lib/objects/Tile";
import { DepthLayers } from "src/game/lib/mappings";

export const renderHoverTile = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const query = [Has(components.HoverTile)];

  let hoverTile: Tile | undefined;
  const render = () => {
    const tileCoord = components.HoverTile.get();

    if (!tileCoord) return;

    if (!hoverTile) {
      hoverTile = new Tile(scene, tileCoord, 0xffffff, 0.2).setDepth(DepthLayers.Tile).spawn();
      return;
    }

    hoverTile.setCoordPosition(tileCoord);
  };

  defineEnterSystem(systemsWorld, query, () => {
    render();
  });

  defineUpdateSystem(systemsWorld, query, render);

  defineExitSystem(systemsWorld, query, () => {
    hoverTile?.dispose();
    hoverTile = undefined;
  });
};
