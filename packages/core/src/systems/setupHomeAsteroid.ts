import { SetupResult } from "@/lib/types";
import { defineComponentSystem, Entity, namespaceWorld } from "@latticexyz/recs";

export const setupHomeAsteroid = async (setupResult: SetupResult) => {
  const {
    network: { world },
    components,
  } = setupResult;

  const systemWorld = namespaceWorld(world, "coreSystems");
  defineComponentSystem(systemWorld, components.Account, ({ value: [value] }) => {
    world.dispose("homeAsteroidAccount");
    const account = value?.value;
    if (!account) return;
    const accountWorld = namespaceWorld(world, "homeAsteroidAccount");

    defineComponentSystem(accountWorld, components.Home, ({ entity, value }) => {
      if (entity !== account) return;
      const newHome = value[0]?.value as Entity | undefined;
      if (!newHome) return;
      components.SelectedRock.set({ value: newHome });
      components.ActiveRock.set({ value: newHome });
      components.BuildRock.set({ value: newHome });
    });
  });
};
