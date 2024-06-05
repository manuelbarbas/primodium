import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { debounce } from "lodash";
import { Core, SyncSourceType } from "@/lib/types";

export const setupSync = (core: Core) => {
  const {
    network: { world },
    components,
    sync: { syncAsteroidData, syncActiveAsteroid, syncFleetData },
  } = core;

  const systemWorld = namespaceWorld(world, "coreSystems");

  //only run sync systems if we are using the indexer
  if (components.SyncSource.get()?.value !== SyncSourceType.Indexer) return;

  defineComponentSystem(systemWorld, components.SelectedRock, ({ value }) => {
    const spaceRock = value[0]?.value;

    if (!spaceRock || value[0]?.value === value[1]?.value) return;

    syncAsteroidData(spaceRock);
  });

  defineComponentSystem(systemWorld, components.ActiveRock, ({ value }) => {
    const spaceRock = value[0]?.value;

    if (!spaceRock || value[0]?.value === value[1]?.value) return;

    syncActiveAsteroid(spaceRock);
  });

  defineComponentSystem(systemWorld, components.SelectedFleet, ({ value }) => {
    const fleet = value[0]?.value;

    if (!fleet || value[0]?.value === value[1]?.value) return;

    syncFleetData(fleet);
  });

  defineComponentSystem(
    systemWorld,
    components.HoverEntity,
    debounce(({ value }) => {
      const hoverEntity = value[0]?.value;

      if (!hoverEntity || value[0]?.value === value[1]?.value) return;

      switch (true) {
        case components.Asteroid.has(hoverEntity):
          //sync asteroid info
          syncAsteroidData(hoverEntity);
          break;
        case components.ShardAsteroid.has(hoverEntity):
          //sync shardasteroid info
          syncAsteroidData(hoverEntity, true); // shard = true
          break;
        case components.FleetMovement.has(hoverEntity):
          //sync fleet info
          syncFleetData(hoverEntity);
          break;
        default:
          break;
      }
    }, 250)
  );
};
