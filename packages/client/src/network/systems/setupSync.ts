import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { world } from "src/network/world";
import { components } from "../components";
import { MUD } from "../types";
import { hydrateActiveAsteroid, hydrateFleetData, hydrateAsteroidData } from "../sync/indexer";
import { SyncSourceType } from "src/util/constants";
import { debounce } from "lodash";

export const setupSync = (mud: MUD) => {
  const systemWorld = namespaceWorld(world, "systems");

  //only run sync systems if we are using the indexer
  if (components.SyncSource.get()?.value !== SyncSourceType.Indexer) return;

  defineComponentSystem(systemWorld, components.SelectedRock, ({ value }) => {
    const spaceRock = value[0]?.value;

    if (!spaceRock || value[0]?.value === value[1]?.value) return;

    hydrateAsteroidData(spaceRock, mud);
  });

  defineComponentSystem(systemWorld, components.ActiveRock, ({ value }) => {
    const spaceRock = value[0]?.value;

    if (!spaceRock || value[0]?.value === value[1]?.value) return;

    hydrateActiveAsteroid(spaceRock, mud);
  });

  defineComponentSystem(systemWorld, components.SelectedFleet, ({ value }) => {
    const fleet = value[0]?.value;

    if (!fleet || value[0]?.value === value[1]?.value) return;

    hydrateFleetData(fleet, mud);
  });

  defineComponentSystem(
    systemWorld,
    components.HoverEntity,
    debounce(({ value }) => {
      const hoverEntity = value[0]?.value;

      if (!hoverEntity || value[0]?.value === value[1]?.value) return;

      switch (true) {
        case components.Asteroid.has(hoverEntity):
          //hydrate asteroid info
          hydrateAsteroidData(hoverEntity, mud);
          break;
        case components.ShardAsteroid.has(hoverEntity):
          //hydrate shardasteroid info
          hydrateAsteroidData(hoverEntity, mud, true); // shard = true
          break;
        case components.FleetMovement.has(hoverEntity):
          //hydrate fleet info
          hydrateFleetData(hoverEntity, mud);
          break;
        default:
          break;
      }
    }, 250)
  );
};
