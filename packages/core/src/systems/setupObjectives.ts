import { Core } from "@/lib/types";
import { Has, HasValue, defineComponentSystem, defineUpdateSystem, namespaceWorld } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";

export const setupObjectives = (core: Core) => {
  const {
    network: { world },
    components,
    utils: { makeObjectiveClaimable },
  } = core;

  const systemWorld = namespaceWorld(world, "coreSystems");

  defineComponentSystem(systemWorld, components.Account, ({ value: [value] }) => {
    world.dispose("objectivesAccount");
    const account = value?.value;
    if (!account) return;
    const accountWorld = namespaceWorld(world, "objectivesAccount");
    const query = [Has(components.Asteroid), HasValue(components.OwnedBy, { value: account })];
    defineUpdateSystem(accountWorld, query, () => {
      makeObjectiveClaimable(account, EObjectives.CaptureAsteroid);
    });
  });
};
