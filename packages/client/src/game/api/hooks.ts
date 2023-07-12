import { SingletonID } from "@latticexyz/network";
import { Network } from "../../network/layer";
import { useComponentValue } from "src/hooks/useComponentValue";
import { Coord } from "@latticexyz/utils";
import { useSettingsStore } from "../stores/SettingsStore";

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

export const useKeybinds = () => {
  const keybinds = useSettingsStore((state) => state.keybinds);

  return keybinds;
};
