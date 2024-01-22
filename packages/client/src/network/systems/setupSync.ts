import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { world } from "src/network/world";
import { components } from "../components";
import { MUD } from "../types";
import { hydrateActiveAsteroid, hydrateSelectedAsteroid } from "../sync/indexer";

export const setupSync = (mud: MUD) => {
  const systemWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemWorld, components.SelectedRock, ({ value }) => {
    const spaceRock = value[0]?.value;

    if (!spaceRock || value[0]?.value === value[1]?.value) return;

    hydrateSelectedAsteroid(spaceRock, mud);
  });

  defineComponentSystem(systemWorld, components.ActiveRock, ({ value }) => {
    const spaceRock = value[0]?.value;

    if (!spaceRock || value[0]?.value === value[1]?.value) return;

    hydrateActiveAsteroid(spaceRock, mud);
  });
};
