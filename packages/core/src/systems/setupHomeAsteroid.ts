import { Entity, namespaceWorld } from "@primodiumxyz/reactive-tables";
import { Core } from "@/lib/types";

export const setupHomeAsteroid = async (core: Core) => {
  const {
    network: { world },
    tables,
  } = core;

  const systemWorld = namespaceWorld(world, "coreSystems");
  tables.Account.watch({
    world: systemWorld,
    onChange: ({ properties: { current } }) => {
      world.dispose("homeAsteroidAccount");

      const account = current?.value;
      if (!account) return;

      const accountWorld = namespaceWorld(world, "homeAsteroidAccount");
      const home = tables.Home.get(account)?.value as Entity;
      if (home) {
        tables.SelectedRock.set({ value: home });
        tables.ActiveRock.set({ value: home });
        tables.BuildRock.set({ value: home });
      }
      tables.Home.watch({
        world: accountWorld,
        onChange: ({ entity, properties }) => {
          if (entity !== account) return;

          const newHome = properties.current?.value as Entity | undefined;
          if (!newHome) return;

          tables.SelectedRock.set({ value: newHome });
          tables.ActiveRock.set({ value: newHome });
          tables.BuildRock.set({ value: newHome });
        },
      });
    },
  });
};
