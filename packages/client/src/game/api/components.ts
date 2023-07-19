import { Perlin, createPerlin } from "@latticexyz/noise";
import { addCoords } from "@latticexyz/phaserx";
import {
  EntityID,
  Has,
  HasValue,
  createEntity,
  getComponentValue,
  getEntitiesWithValue,
  removeComponent,
  runQuery,
  setComponent,
  updateComponent,
  withValue,
} from "@latticexyz/recs";

import { Coord } from "@latticexyz/utils";
import { offChainComponents, singletonIndex } from "src/network/world";
import { getAttackRadius, isValidWeaponStorage } from "src/util/attack";
import { Action } from "src/util/constants";
import {
  getBuildingsOfTypeInRange,
  getEntityTileAtCoord,
  getTilesOfTypeInRange,
} from "src/util/tile";
import { Network } from "../../network/layer";

let perlin: Perlin;
(async () => {
  perlin = await createPerlin();
})();

export const gameReady = (network: Network) => {
  const { singletonIndex, offChainComponents } = network;

  return {
    set: (value: boolean) => {
      setComponent(offChainComponents.GameReady, singletonIndex, {
        value,
      });
    },
    get: () => {
      return getComponentValue(offChainComponents.GameReady, singletonIndex)
        ?.value;
    },
    remove: () => {
      return removeComponent(offChainComponents.GameReady, singletonIndex);
    },
  };
};

export const selectedTile = (network: Network) => {
  const { singletonIndex, offChainComponents } = network;

  return {
    set: (coord: Coord) => {
      setComponent(offChainComponents.SelectedTile, singletonIndex, coord);
    },
    get: () => {
      return getComponentValue(
        offChainComponents.SelectedTile,
        singletonIndex
      ) as Coord | undefined;
    },
    remove: () => {
      return removeComponent(offChainComponents.SelectedTile, singletonIndex);
    },
  };
};

export const hoverTile = (network: Network) => {
  const { singletonIndex, offChainComponents } = network;

  return {
    set: (coord: Coord) => {
      setComponent(offChainComponents.HoverTile, singletonIndex, coord);
    },
    get: () => {
      return getComponentValue(offChainComponents.HoverTile, singletonIndex) as
        | Coord
        | undefined;
    },
    remove: () => {
      return removeComponent(offChainComponents.HoverTile, singletonIndex);
    },
  };
};

export const selectedBuilding = (network: Network) => {
  const { offChainComponents, singletonIndex } = network;

  return {
    set: (entityID: EntityID) => {
      setComponent(offChainComponents.SelectedBuilding, singletonIndex, {
        value: entityID,
      });
    },
    get: () => {
      return getComponentValue(
        offChainComponents.SelectedBuilding,
        singletonIndex
      )?.value as EntityID | undefined;
    },
    remove: () => {
      return removeComponent(
        offChainComponents.SelectedBuilding,
        singletonIndex
      );
    },
  };
};

export const startSelectedPath = (network: Network) => {
  const { singletonIndex, offChainComponents } = network;

  return {
    set: (coord: Coord) => {
      setComponent(offChainComponents.StartSelectedPath, singletonIndex, coord);
    },
    get: () => {
      return getComponentValue(
        offChainComponents.StartSelectedPath,
        singletonIndex
      ) as Coord | undefined;
    },
    remove: () => {
      return removeComponent(
        offChainComponents.StartSelectedPath,
        singletonIndex
      );
    },
  };
};

export const selectedAttack = (network: Network) => {
  const { offChainComponents, singletonIndex } = network;

  const get = () => {
    const value = getComponentValue(
      offChainComponents.SelectedAttack,
      singletonIndex
    );

    return {
      origin: (JSON.parse(value?.origin ?? "null") ?? undefined) as
        | Coord
        | undefined,
      target: (JSON.parse(value?.target ?? "null") ?? undefined) as
        | Coord
        | undefined,
    };
  };

  const setOrigin = (coord: Coord) => {
    const originEntityBuilding = getEntityTileAtCoord(coord);

    //if origin entity is not a weapon storage or empty, reset selection
    if (!originEntityBuilding || !isValidWeaponStorage(originEntityBuilding)) {
      console.warn("Origin is not valid");
      remove();
      return;
    }

    updateComponent(offChainComponents.SelectedAttack, singletonIndex, {
      origin: JSON.stringify(coord),
    });
  };

  const setTarget = (coord: Coord) => {
    const selectedAttackTiles = get();

    if (!selectedAttackTiles.origin) {
      console.log("origin is not set");
      return;
    }

    const targetEntityBuilding = getEntityTileAtCoord(coord);

    //check if target is valid
    if (!targetEntityBuilding) {
      console.warn("Target is not valid");
      return;
    }

    const originEntityBuilding = getEntityTileAtCoord(
      selectedAttackTiles.origin
    );

    if (!originEntityBuilding) {
      console.warn("Origin is not valid");
      return;
    }

    //check if target is in attack radius
    const attackRadius = getAttackRadius(originEntityBuilding);

    // compare x and y values of start and end
    const xDiff = Math.abs(selectedAttackTiles.origin.x - coord.x);
    const yDiff = Math.abs(selectedAttackTiles.origin.y - coord.y);

    if (xDiff > attackRadius || yDiff > attackRadius) {
      console.warn("Target is not in attack radius");
      return;
    } else if (xDiff === 0 && yDiff === 0) {
      console.warn("Target is the same as origin");
      return;
    }

    updateComponent(offChainComponents.SelectedAttack, singletonIndex, {
      target: JSON.stringify(coord),
    });
  };

  const remove = () => {
    return removeComponent(offChainComponents.SelectedAttack, singletonIndex);
  };

  return {
    setOrigin,
    setTarget,
    get,
    remove,
  };
};

export const marker = (network: Network) => {
  const { offChainComponents, components, world } = network;

  const set = (coord: Coord, type: EntityID) => {
    const entities = getEntitiesWithValue(components.Position, coord);

    //check if there is an entity with given coord, if not create one and add position
    if (!entities.size) {
      //create entity
      const entity = createEntity(world, [
        withValue(components.Position, coord),
        withValue(offChainComponents.Marker, { value: type }),
      ]);

      return entity;
    } else {
      const entity = entities.values().next().value;
      setComponent(offChainComponents.Marker, entity, {
        value: type,
      });

      return entity;
    }
  };

  const target = async (
    tile: EntityID,
    type: EntityID,
    origin: Coord,
    range: number,
    excludeRange: number = 0,
    offset: Coord = { x: 0, y: 0 }
  ) => {
    const tiles = getTilesOfTypeInRange(
      origin,
      tile,
      range,
      excludeRange,
      perlin
    );

    const buildings = getBuildingsOfTypeInRange(origin, tile, range);

    //handle terrain
    for (const tile of tiles) {
      set(addCoords(tile, offset), type);
    }

    //handle buildings
    for (const building of buildings) {
      set(addCoords(building, offset), type);
    }
  };

  const get = (coord: Coord) => {
    const entities = runQuery([
      Has(offChainComponents.Marker),
      HasValue(components.Position, coord),
    ]);

    return entities;
  };

  const getOfType = (type: EntityID) => {
    const entities = runQuery([
      HasValue(offChainComponents.Marker, { value: type }),
    ]);

    return entities;
  };

  const remove = (coord: Coord) => {
    const entities = runQuery([
      HasValue(components.Position, coord),
      Has(offChainComponents.Marker),
    ]);

    const entityIndex = entities.values().next().value;

    removeComponent(offChainComponents.Marker, entityIndex);
  };

  const removeAll = () => {
    const entities = runQuery([Has(offChainComponents.Marker)]);

    for (const entity of entities) {
      removeComponent(offChainComponents.Marker, entity);
    }
  };

  return {
    set,
    get,
    getOfType,
    target,
    remove,
    removeAll,
  };
};

export const mainBase = (network: Network) => {
  const { singletonIndex, components, world } = network;

  const dummyCoord = { x: 0, y: 0 };
  return {
    get: (address: string) => {
      // resourceKey of the entity
      const resourceKey = address
        ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)!
        : singletonIndex;

      // fetch the main base of the user based on address
      const mainBase = getComponentValue(
        components.MainBaseInitialized,
        resourceKey
      )?.value;
      if (!mainBase) return dummyCoord;

      const mainBaseEntity = world.entityToIndex.get(mainBase);

      if (!mainBaseEntity) return dummyCoord;
      return (
        getComponentValue(components.Position, mainBaseEntity) ?? dummyCoord
      );
    },
  };
};

export const selectedAction = () => {
  const get = () => {
    return getComponentValue(offChainComponents.SelectedAction, singletonIndex)
      ?.value;
  };

  const set = (value: Action) => {
    setComponent(offChainComponents.SelectedAction, singletonIndex, {
      value,
    });
  };

  const remove = () => {
    return removeComponent(offChainComponents.SelectedAction, singletonIndex);
  };

  return { get, set, remove };
};
