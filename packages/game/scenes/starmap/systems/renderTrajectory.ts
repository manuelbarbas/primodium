import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { components } from "@primodiumxyz/core/network/components";
import { world } from "@primodiumxyz/core/network/world";

import { TargetLine } from "@/lib/objects/TargetLine";
import { PrimodiumScene } from "@/api/scene";

export const renderTrajectory = (scene: PrimodiumScene) => {
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

    const pixelOrigin = scene.utils.tileCoordToPixelCoord({ x: originPos.x, y: -originPos.y });
    const pixelDest = scene.utils.tileCoordToPixelCoord({ x: destPos.x, y: -destPos.y });
    trajectoryLine.setActive(true).setVisible(true);
    trajectoryLine.setCoordinates(pixelOrigin, pixelDest);
  });

  systemsWorld.registerDisposer(() => {
    trajectoryLine.destroy();
  });
};
