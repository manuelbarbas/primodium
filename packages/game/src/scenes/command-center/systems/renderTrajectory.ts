import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "@primodiumxyz/core/network/components";
import { world } from "@primodiumxyz/core/network/world";

import { TargetLine } from "@/lib/objects/TargetLine";
import { PrimodiumScene } from "@/api/scene";

export const renderTrajectory = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const trajectoryLine = new TargetLine(scene, { x: 0, y: 0 }, { x: 0, y: 0 }, 0xff0000)
    .setAlpha(0.3)
    .spawn()
    .setActive(false)
    .setVisible(false)
    .setDepth(0);

  defineComponentSystem(systemsWorld, components.HoverEntity, async ({ value }) => {
    const entity = value[0]?.value as Entity;
    const destination = components.BattleTarget.get()?.value;

    if (!destination || !entity) {
      trajectoryLine.setActive(false).setVisible(false);
      return;
    }

    const fleetObj = scene.objects.fleet.get(entity);

    const targetObj = components.IsFleet.get(destination)?.value
      ? scene.objects.fleet.get(destination ?? singletonEntity)
      : scene.objects.asteroid.get(destination ?? singletonEntity);

    if (!fleetObj || !targetObj) {
      trajectoryLine.setActive(false).setVisible(false);
      return;
    }

    trajectoryLine.setActive(true).setVisible(true);
    trajectoryLine.setCoordinates(fleetObj.getPixelCoord(), targetObj.getPixelCoord());
  });

  systemsWorld.registerDisposer(() => {
    trajectoryLine.destroy();
  });
};
