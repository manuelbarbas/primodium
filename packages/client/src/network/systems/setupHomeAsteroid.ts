import { components } from "@/network/components";
import { MUD } from "@/network/types";
import { world } from "@/network/world";
import { defineComponentSystem, Entity } from "@latticexyz/recs";

export const setupHomeAsteroid = async (mud: MUD) => {
  defineComponentSystem(world, components.Home, ({ entity, value }) => {
    if (entity !== mud.playerAccount.entity) return;
    const newHome = value[0]?.value as Entity | undefined;
    if (!newHome) return;
    mud.components.SelectedRock.set({ value: newHome });
    mud.components.ActiveRock.set({ value: newHome });
    mud.components.BuildRock.set({ value: newHome });
  });
};
