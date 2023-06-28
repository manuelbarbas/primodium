import {
  EntityID,
  getComponentValue,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { SingletonID } from "@latticexyz/network";
import { Network } from "../../network/layer";

export const setSelectedTileComponent = (coord: Coord, network: Network) => {
  const { world, offChainComponents } = network;
  const singletonIndex = world.entityToIndex.get(SingletonID)!;

  setComponent(offChainComponents.SelectedTile, singletonIndex, coord);
};

export const getSelectedTileComponent = (network: Network) => {
  const { world, offChainComponents } = network;
  const singletonIndex = world.entityToIndex.get(SingletonID)!;

  return getComponentValue(
    offChainComponents.HoverTile,
    singletonIndex
  ) as Coord;
};

export const removeSelectedTileComponent = (network: Network) => {
  const { world, offChainComponents } = network;
  const singletonIndex = world.entityToIndex.get(SingletonID)!;

  return removeComponent(offChainComponents.SelectedTile, singletonIndex);
};

export const setHoverTileComponent = (coord: Coord, network: Network) => {
  const { world, offChainComponents } = network;
  const singletonIndex = world.entityToIndex.get(SingletonID)!;

  setComponent(offChainComponents.HoverTile, singletonIndex, coord);
};

export const setSelectedBuildingComponent = (
  building: EntityID,
  network: Network
) => {
  const { world, offChainComponents } = network;

  const singletonIndex = world.entityToIndex.get(SingletonID)!;

  setComponent(offChainComponents.SelectedBuilding, singletonIndex, {
    value: building,
  });
};

export const getSelectedBuildingComponent = (network: Network) => {
  const { world, offChainComponents } = network;
  const singletonIndex = world.entityToIndex.get(SingletonID)!;

  return getComponentValue(offChainComponents.SelectedBuilding, singletonIndex)
    ?.value;
};

export const removeSelectedBuildingComponent = (network: Network) => {
  const { world, offChainComponents } = network;
  const singletonIndex = world.entityToIndex.get(SingletonID)!;

  return removeComponent(offChainComponents.SelectedBuilding, singletonIndex);
};
