import { namespaceWorld } from "@primodiumxyz/reactive-tables";
import { Core } from "@/lib/types";

export const setupBuildRock = (core: Core) => {
  const {
    network: { world },
    tables,
  } = core;

  const systemWorld = namespaceWorld(world, "coreSystems");
  const playerEntity = tables.Account.get()?.value;

  const activeRockWorld = namespaceWorld(world, "activeRock");
  tables.ActiveRock.watch({
    world: systemWorld,
    onUpdate: ({ properties }) => {
      activeRockWorld.dispose();
      const spaceRock = properties.current?.value;
      const ownedBy = tables.OwnedBy.get(spaceRock)?.value;

      if (!spaceRock) return;

      if (playerEntity === ownedBy) tables.BuildRock.set({ value: spaceRock });

      tables.OwnedBy.watch({
        world: activeRockWorld,
        onUpdate: ({ entity, properties }) => {
          if (entity !== spaceRock) return;
          const newOwner = properties.current?.value;

          if (newOwner !== playerEntity) {
            return;
          }

          if (newOwner === playerEntity) {
            tables.BuildRock.set({ value: spaceRock });
          }
        },
      });
    },
  });
};
