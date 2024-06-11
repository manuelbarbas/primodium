import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";

import { Core } from "@/lib/types";

export const setupBuildRock = (core: Core) => {
  const {
    network: { world },
    tables,
  } = core;

  const systemWorld = namespaceWorld(world, "coreSystems");
  const playerEntity = tables.Account.get()?.value;

  const activeRockWorld = namespaceWorld(world, "activeRock");
  defineComponentSystem(systemWorld, tables.ActiveRock, ({ value }) => {
    activeRockWorld.dispose();
    const spaceRock = value[0]?.value;
    const ownedBy = tables.OwnedBy.get(spaceRock)?.value;

    if (!spaceRock) return;

    if (playerEntity === ownedBy) tables.BuildRock.set({ value: spaceRock });

    defineComponentSystem(activeRockWorld, tables.OwnedBy, ({ entity, value }) => {
      if (entity !== spaceRock) return;
      const newOwner = value[0]?.value;

      if (newOwner !== playerEntity) {
        return;
      }

      if (newOwner === playerEntity) {
        tables.BuildRock.set({ value: spaceRock });
      }
    });
  });
};
