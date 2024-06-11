import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Core, SyncSourceType } from "@/lib/types";

function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;

  return function (...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const setupSync = (core: Core) => {
  const {
    network: { world },
    tables,
    sync: { syncAsteroidData, syncActiveAsteroid, syncFleetData },
  } = core;

  const systemWorld = namespaceWorld(world, "coreSystems");

  //only run sync systems if we are using the indexer
  if (tables.SyncSource.get()?.value !== SyncSourceType.Indexer) return;

  defineComponentSystem(systemWorld, tables.SelectedRock, ({ value }) => {
    const spaceRock = value[0]?.value;

    if (!spaceRock || value[0]?.value === value[1]?.value) return;

    syncAsteroidData(spaceRock);
  });

  defineComponentSystem(systemWorld, tables.ActiveRock, ({ value }) => {
    const spaceRock = value[0]?.value;

    if (!spaceRock || value[0]?.value === value[1]?.value) return;

    syncActiveAsteroid(spaceRock);
  });

  defineComponentSystem(systemWorld, tables.SelectedFleet, ({ value }) => {
    const fleet = value[0]?.value;

    if (!fleet || value[0]?.value === value[1]?.value) return;

    syncFleetData(fleet);
  });

  defineComponentSystem(
    systemWorld,
    tables.HoverEntity,
    debounce(({ value }) => {
      const hoverEntity = value[0]?.value;

      if (!hoverEntity || value[0]?.value === value[1]?.value) return;

      switch (true) {
        case tables.Asteroid.has(hoverEntity):
          //sync asteroid info
          syncAsteroidData(hoverEntity);
          break;
        case tables.ShardAsteroid.has(hoverEntity):
          //sync shardasteroid info
          syncAsteroidData(hoverEntity, true); // shard = true
          break;
        case tables.FleetMovement.has(hoverEntity):
          //sync fleet info
          syncFleetData(hoverEntity);
          break;
        default:
          break;
      }
    }, 250)
  );
};
