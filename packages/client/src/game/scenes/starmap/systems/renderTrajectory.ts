import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { TargetLine } from "@/game/lib/objects/TargetLine";

export const renderTrajectory = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const trajectoryLine = new TargetLine(scene, { x: 0, y: 0 }, { x: 0, y: 0 })
    .setAlpha(0.3)
    .spawn()
    .setActive(false)
    .setVisible(false)
    .setDepth(0);

  defineComponentSystem(systemsWorld, components.HoverEntity, async ({ value }) => {
    const entity = value[0]?.value as Entity;
    const origin = components.FleetMovement.get(entity)?.destination;
    const destination = components.SelectedRock.get()?.value;
    const originPos = components.Position.get(origin as Entity);
    const destPos = components.Position.get(destination);

    if (!originPos || !destPos) {
      trajectoryLine.setActive(false).setVisible(false);
      return;
    }

    const pixelOrigin = tileCoordToPixelCoord(
      { x: originPos.x, y: -originPos.y },
      scene.tiled.tileWidth,
      scene.tiled.tileHeight
    );
    const pixelDest = tileCoordToPixelCoord(
      { x: destPos.x, y: -destPos.y },
      scene.tiled.tileWidth,
      scene.tiled.tileHeight
    );
    trajectoryLine.setActive(true).setVisible(true);
    trajectoryLine.setCoordinates(pixelOrigin, pixelDest);
  });

  systemsWorld.registerDisposer(() => {
    trajectoryLine.dispose();
  });
};
