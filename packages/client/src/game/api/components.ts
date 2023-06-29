import {
  EntityID,
  getComponentValue,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { SingletonID } from "@latticexyz/network";
import { Network } from "../../network/layer";

export const selectedTile = (network: Network) => {
  const { world, offChainComponents } = network;
  const singletonIndex = world.entityToIndex.get(SingletonID)!;

  return {
    set: (coord: Coord) => {
      setComponent(offChainComponents.SelectedTile, singletonIndex, coord);
    },
    get: () => {
      return getComponentValue(
        offChainComponents.SelectedTile,
        singletonIndex
      ) as Coord;
    },
    remove: () => {
      return removeComponent(offChainComponents.SelectedTile, singletonIndex);
    },
  };
};

export const hoverTile = (network: Network) => {
  const { world, offChainComponents } = network;
  const singletonIndex = world.entityToIndex.get(SingletonID)!;

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
  const { world, offChainComponents } = network;
  const singletonIndex = world.entityToIndex.get(SingletonID)!;

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
  const { world, offChainComponents } = network;
  const singletonIndex = world.entityToIndex.get(SingletonID)!;

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
