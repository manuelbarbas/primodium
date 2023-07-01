import {
  EntityID,
  getComponentValue,
  removeComponent,
  setComponent,
  updateComponent,
} from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Network } from "../../network/layer";
import { getEntityAtCoord } from "src/util/tile";
import { getAttackRadius, isValidWeaponStorage } from "src/util/attack";

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
    const originEntityBuilding = getEntityAtCoord(coord, network);

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

    const targetEntityBuilding = getEntityAtCoord(coord, network);

    //check if target is valid
    if (!targetEntityBuilding) {
      console.warn("Target is not valid");
      return;
    }

    const originEntityBuilding = getEntityAtCoord(
      selectedAttackTiles.origin,
      network
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
