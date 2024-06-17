import { namespaceWorld } from "@primodiumxyz/reactive-tables";
import { Core, EntityType } from "@primodiumxyz/core";
import { PrimodiumScene } from "@/types";

export const focusMainbase = (scene: PrimodiumScene, core: Core) => {
  const {
    network: { world },
    tables,
  } = core;

  const systemsWorld = namespaceWorld(world, "systems");

  const handleMove = () => {
    const mainBaseCoord = tables.Position.get(EntityType.MainBase) ?? { x: 0, y: 0 };

    scene.camera.pan(mainBaseCoord, {
      duration: 0,
    });
  };

  tables.ActiveRock.watch({
    world: systemsWorld,
    onChange: handleMove,
  });
};
