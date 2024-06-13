import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Entity, namespaceWorld } from "@primodiumxyz/reactive-tables";
import { Core } from "@primodiumxyz/core";

import { TargetLine } from "@/lib/objects/TargetLine";
import { PrimodiumScene } from "@/api/scene";

export const renderTrajectory = (scene: PrimodiumScene, core: Core) => {
  const {
    tables,
    network: { world },
  } = core;
  const systemsWorld = namespaceWorld(world, "systems");
  const trajectoryLine = new TargetLine("trajectoryLine" as Entity, scene, { x: 0, y: 0 }, { x: 0, y: 0 }, 0xff0000)
    .setAlpha(0.3)
    .spawn()
    .setActive(false)
    .setVisible(false)
    .setDepth(0);

  tables.HoverEntity.watch({
    world: systemsWorld,
    onUpdate: ({ properties: { current } }) => {
      const entity = current?.value;
      const destination = tables.BattleTarget.get()?.value;

      if (!destination || !entity) {
        trajectoryLine.setActive(false).setVisible(false);
        return;
      }

      const fleetObj = scene.objects.fleet.get(entity);

      const targetObj = tables.IsFleet.get(destination)?.value
        ? scene.objects.fleet.get(destination ?? singletonEntity)
        : scene.objects.asteroid.get(destination ?? singletonEntity);

      if (!fleetObj || !targetObj) {
        trajectoryLine.setActive(false).setVisible(false);
        return;
      }

      trajectoryLine.setActive(true).setVisible(true);
      trajectoryLine.setCoordinates(fleetObj.getPixelCoord(), targetObj.getPixelCoord());
    },
  });

  systemsWorld.registerDisposer(() => {
    trajectoryLine.destroy();
  });
};
