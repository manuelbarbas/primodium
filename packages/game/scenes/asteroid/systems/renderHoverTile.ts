import { Has, defineEnterSystem, defineExitSystem, defineUpdateSystem, namespaceWorld } from "@latticexyz/recs";
import { components } from "@primodiumxyz/core/network/components";
import { world } from "@primodiumxyz/core/network/world";
import { DepthLayers } from "@primodiumxyz/core/game/lib/constants/common";

import { PrimodiumScene } from "@/api/scene";
import { Tile } from "@/lib/objects/Tile";

export const renderHoverTile = (scene: PrimodiumScene) => {
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
