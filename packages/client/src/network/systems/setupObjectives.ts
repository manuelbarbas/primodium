import { Has, HasValue, defineUpdateSystem, namespaceWorld } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { world } from "src/network/world";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
import { components } from "../components";
import { MUD } from "../types";

export const setupObjectives = (mud: MUD) => {
  const systemWorld = namespaceWorld(world, "systems");

  const query = [Has(components.Asteroid), HasValue(components.OwnedBy, { value: mud.playerAccount.entity })];
  defineUpdateSystem(systemWorld, query, () => {
    makeObjectiveClaimable(mud.playerAccount.entity, EObjectives.CaptureAsteroid);
  });
};
