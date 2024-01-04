import { Entity, defineComponentSystem } from "@latticexyz/recs";
import { world } from "src/network/world";
import { components } from "../components";
import { MUD } from "../types";
export const setupSend = (mud: MUD) => {
  defineComponentSystem(world, components.Home, ({ entity, value }) => {
    if (entity != mud.playerAccount.entity) return;
    const asteroid = value[0]?.asteroid as Entity | undefined;
    if (!asteroid) return;
    // temp so we can test without the set origin ui
    components.Send.setOrigin(asteroid);
  });
};
