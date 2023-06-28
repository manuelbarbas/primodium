import { useComponentValue } from "@latticexyz/react";
import { SingletonID } from "@latticexyz/network";
import { Network } from "../../network/layer";

export const useSelectedTile = (network: Network) => {
  const { offChainComponents, world } = network;

  const singletonIndex = world.entityToIndex.get(SingletonID);

  return useComponentValue(offChainComponents.SelectedTile, singletonIndex, {
    x: 0,
    y: 0,
  });
};

export const useHoverTile = (network: Network) => {
  const { offChainComponents, world } = network;

  const singletonIndex = world.entityToIndex.get(SingletonID);

  return useComponentValue(offChainComponents.SelectedTile, singletonIndex, {
    x: 0,
    y: 0,
  });
};

export const useSelectedBuilding = (network: Network) => {
  const { offChainComponents, world } = network;

  const singletonIndex = world.entityToIndex.get(SingletonID);

  return useComponentValue(
    offChainComponents.SelectedBuilding,
    singletonIndex,
    {
      value: "",
    }
  );
};
