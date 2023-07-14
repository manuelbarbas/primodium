import { Coord } from "@latticexyz/utils";
import { useComponentValue } from "src/hooks/useComponentValue";
import { offChainComponents, singletonIndex, world } from "src/network/world";
import { Network } from "../../network/layer";

export const useSelectedTile = () => {
  return useComponentValue(offChainComponents.SelectedTile, singletonIndex);
};

export const useHoverTile = () => {
  return useComponentValue(offChainComponents.SelectedTile, singletonIndex);
};

export const useSelectedBuilding = () => {
  const buildingEntity = useComponentValue(
    offChainComponents.SelectedBuilding,
    singletonIndex
  )?.value;
  if (!buildingEntity) return;
  return world.entityToIndex.get(buildingEntity);
};

export const useStartSelectedPath = () => {
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
