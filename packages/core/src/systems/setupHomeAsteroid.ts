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
