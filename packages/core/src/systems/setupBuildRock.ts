import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";

import { SetupResult } from "@/lib/types";

export const setupBuildRock = (setupResult: SetupResult) => {
  const {
    network: { world },
    components,
  } = setupResult;

  const systemWorld = namespaceWorld(world, "coreSystems");
  const playerEntity = components.Account.get()?.value;

  const activeRockWorld = namespaceWorld(world, "activeRock");
  defineComponentSystem(systemWorld, components.ActiveRock, ({ value }) => {
    activeRockWorld.dispose();
    const spaceRock = value[0]?.value;
    const ownedBy = components.OwnedBy.get(spaceRock)?.value;

    if (!spaceRock) return;

    if (playerEntity === ownedBy) components.BuildRock.set({ value: spaceRock });

    defineComponentSystem(activeRockWorld, components.OwnedBy, ({ entity, value }) => {
      if (entity !== spaceRock) return;
      const newOwner = value[0]?.value;

      if (newOwner !== playerEntity) {
        return;
      }

      if (newOwner === playerEntity) {
        components.BuildRock.set({ value: spaceRock });
      }
    });
  });
};
