import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { defineRxSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";

export const setupMapBounds = (scene: Scene) => {
  const gameWorld = namespaceWorld(world, "game");

  defineRxSystem(gameWorld, scene.camera.worldView$, (worldView) => {
    console.log("worldView", worldView);
    const { x, y } = pixelCoordToTileCoord(
      { x: worldView.x, y: worldView.y },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );
    const { x: width, y: height } = pixelCoordToTileCoord(
      { x: worldView.width, y: worldView.height },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );
    components.MapBounds.set({
      x,
      y,
      width,
      height,
    });
  });
};
