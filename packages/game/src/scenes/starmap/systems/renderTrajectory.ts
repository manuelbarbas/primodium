import { Core } from "@primodiumxyz/core";

import { TargetLine } from "@/lib/objects/TargetLine";
import { PrimodiumScene } from "@/api/scene";
import { Entity, namespaceWorld } from "@primodiumxyz/reactive-tables";

export const renderTrajectory = (scene: PrimodiumScene, core: Core) => {
  const {
    network: { world },
    tables,
  } = core;
  const systemsWorld = namespaceWorld(world, "systems");
  const trajectoryLine = new TargetLine(scene, { x: 0, y: 0 }, { x: 0, y: 0 })
    .setAlpha(0.3)
    .spawn()
    .setActive(false)
    .setVisible(false)
    .setDepth(0);

  tables.HoverEntity.watch({
    world: systemsWorld,
    onUpdate: ({ properties: { current } }) => {
      const entity = current?.value;
      const origin = tables.FleetMovement.get(entity)?.destination;
      const destination = tables.SelectedRock.get()?.value;
      const originPos = tables.Position.get(origin as Entity);
      const destPos = tables.Position.get(destination);

      if (!originPos || !destPos) {
        trajectoryLine.setActive(false).setVisible(false);
        return;
      }

      const pixelOrigin = scene.utils.tileCoordToPixelCoord({ x: originPos.x, y: -originPos.y });
      const pixelDest = scene.utils.tileCoordToPixelCoord({ x: destPos.x, y: -destPos.y });
      trajectoryLine.setActive(true).setVisible(true);
      trajectoryLine.setCoordinates(pixelOrigin, pixelDest);
    },
  });

  systemsWorld.registerDisposer(() => {
    trajectoryLine.destroy();
  });
};
