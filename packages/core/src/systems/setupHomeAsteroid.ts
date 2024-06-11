import { Core } from "@/lib/types";
import { defineComponentSystem, Entity, namespaceWorld } from "@latticexyz/recs";

export const setupHomeAsteroid = async (core: Core) => {
  const {
    network: { world },
    tables,
  } = core;

  const systemWorld = namespaceWorld(world, "coreSystems");
  defineComponentSystem(systemWorld, tables.Account, ({ value: [value] }) => {
    world.dispose("homeAsteroidAccount");
    const account = value?.value;
    if (!account) return;
    const accountWorld = namespaceWorld(world, "homeAsteroidAccount");

    defineComponentSystem(accountWorld, tables.Home, ({ entity, value }) => {
      if (entity !== account) return;
      const newHome = value[0]?.value as Entity | undefined;
      if (!newHome) return;
      tables.SelectedRock.set({ value: newHome });
      tables.ActiveRock.set({ value: newHome });
      tables.BuildRock.set({ value: newHome });
    });
  });
};
