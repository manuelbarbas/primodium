import { Core } from "@primodiumxyz/core";
import { $query, namespaceWorld } from "@primodiumxyz/reactive-tables";
import { PrimodiumScene } from "@/api/scene";
import { DepthLayers } from "@/lib/constants/common";
import { Tile } from "@/lib/objects/Tile";

export const renderHoverTile = (scene: PrimodiumScene, core: Core) => {
  const {
    network: { world },
    tables,
  } = core;

  const systemsWorld = namespaceWorld(world, "systems");

  const query = { with: [tables.HoverTile] };

  let hoverTile: Tile | undefined;
  const render = () => {
    const tileCoord = tables.HoverTile.get();

    if (!tileCoord) return;

    if (!hoverTile) {
      hoverTile = new Tile(scene, tileCoord, 0xffffff, 0.2).setDepth(DepthLayers.Tile).spawn();
      return;
    }

    hoverTile.setCoordPosition(tileCoord);
  };

  $query(systemsWorld, query, {
    onEnter: render,
    onChange: render,
    onExit: () => {
      hoverTile?.dispose();
      hoverTile = undefined;
    },
  });
};
