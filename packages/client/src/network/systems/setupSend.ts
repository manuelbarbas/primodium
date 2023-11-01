import { Entity, defineComponentSystem } from "@latticexyz/recs";
import { world } from "src/network/world";
import { components } from "../components";
export const setupSend = (player: Entity) => {
  defineComponentSystem(world, components.Home, ({ entity, value }) => {
    if (entity != player) return;
    const asteroid = value[0]?.asteroid as Entity | undefined;
    if (!asteroid) return;
    // temp so we can test without the set origin ui
    components.Send.setOrigin(asteroid);
  });

  // this is a hack because the component.use hook can't pick up deleteRecord events
  defineComponentSystem(world, components.GracePeriod, ({ entity, value }) => {
    if (!value[0])
      components.GracePeriod.set({ value: 0n, __dynamicData: "", __encodedLengths: "", __staticData: "" }, entity);
  });
};
