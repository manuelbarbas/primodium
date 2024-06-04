import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { hydrateActiveAsteroid, hydrateFleetData, hydrateAsteroidData } from "../sync/indexer";
import { debounce } from "lodash";
import { SetupResult, SyncSourceType } from "@/lib/types";

export const setupSync = (setupResult: SetupResult) => {
  const {
    network: { world },
    components,
  } = setupResult;

  const systemWorld = namespaceWorld(world, "coreSystems");

  //only run sync systems if we are using the indexer
  if (components.SyncSource.get()?.value !== SyncSourceType.Indexer) return;

  defineComponentSystem(systemWorld, components.SelectedRock, ({ value }) => {
    const spaceRock = value[0]?.value;

    if (!spaceRock || value[0]?.value === value[1]?.value) return;

    hydrateAsteroidData(setupResult, spaceRock);
  });

  defineComponentSystem(systemWorld, components.ActiveRock, ({ value }) => {
    const spaceRock = value[0]?.value;

    if (!spaceRock || value[0]?.value === value[1]?.value) return;

    hydrateActiveAsteroid(setupResult, spaceRock);
  });

  defineComponentSystem(systemWorld, components.SelectedFleet, ({ value }) => {
    const fleet = value[0]?.value;

    if (!fleet || value[0]?.value === value[1]?.value) return;

    hydrateFleetData(setupResult, fleet);
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
          hydrateAsteroidData(setupResult, hoverEntity);
          break;
        case components.ShardAsteroid.has(hoverEntity):
          //hydrate shardasteroid info
          hydrateAsteroidData(setupResult, hoverEntity, true); // shard = true
          break;
        case components.FleetMovement.has(hoverEntity):
          //hydrate fleet info
          hydrateFleetData(setupResult, hoverEntity);
          break;
        default:
          break;
      }
    }, 250)
  );
};
