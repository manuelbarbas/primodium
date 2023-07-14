import { SingletonID } from "@latticexyz/network";
import { Coord } from "@latticexyz/utils";
import { useComponentValue } from "src/hooks/useComponentValue";
import { Network } from "../../network/layer";

export const useSelectedTile = (network: Network) => {
  const { offChainComponents, world } = network;

  const singletonIndex = world.entityToIndex.get(SingletonID);

  return useComponentValue(offChainComponents.SelectedTile, singletonIndex);
};

export const useHoverTile = (network: Network) => {
  const { offChainComponents, world } = network;

  const singletonIndex = world.entityToIndex.get(SingletonID);

  return useComponentValue(offChainComponents.SelectedTile, singletonIndex);
};

export const useSelectedBuilding = (network: Network) => {
  const { offChainComponents, world } = network;

  const singletonIndex = world.entityToIndex.get(SingletonID);

  return useComponentValue(offChainComponents.SelectedBuilding, singletonIndex)
    ?.value;
};

export const useStartSelectedPath = (network: Network) => {
  const { offChainComponents, world } = network;

  const singletonIndex = world.entityToIndex.get(SingletonID);

  return useComponentValue(
    offChainComponents.StartSelectedPath,
    singletonIndex
  );
};

export const useSelectedAttack = (network: Network) => {
  const { offChainComponents, singletonIndex } = network;

  const selectedAttack = useComponentValue(
    offChainComponents.SelectedAttack,
    singletonIndex,
    {
      origin: undefined,
      target: undefined,
    }
  );

  return {
    origin: (JSON.parse(selectedAttack?.origin ?? "null") ?? undefined) as
      | Coord
      | undefined,
    target: (JSON.parse(selectedAttack?.target ?? "null") ?? undefined) as
      | Coord
      | undefined,
  };
};
