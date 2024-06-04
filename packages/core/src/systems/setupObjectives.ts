import { SetupResult } from "@/lib/types";
import { Has, HasValue, defineComponentSystem, defineUpdateSystem, namespaceWorld } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";

export const setupObjectives = (setupResult: SetupResult) => {
  const {
    network: { world },
    components,
    utils: { makeObjectiveClaimable },
  } = setupResult;

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
