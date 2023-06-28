import { EntityID, setComponent } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { SingletonID } from "@latticexyz/network";
import { Network } from "../../network/layer";

export const setSelectedTileComponent = (coord: Coord, network: Network) => {
  const { world, offChainComponents } = network;
  const singletonIndex = world.entityToIndex.get(SingletonID)!;

  setComponent(offChainComponents.SelectedTile, singletonIndex, coord);
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
