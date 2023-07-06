import { primodium } from "@game/api";
import { Coord } from "@latticexyz/utils";
import { coordEq } from "@latticexyz/phaserx";

import { Network } from "src/network/layer";
import { BlockType } from "./constants";
import { useTourStore } from "src/store/TourStore";
import { EntityID, getComponentValue } from "@latticexyz/recs";

export const inTutorial = (address: string, network: Network) => {
  const completedTutorial = useTourStore.getState().completedTutorial;
  const checkpoint = useTourStore.getState().checkpoint;
  const { components, world, singletonIndex } = network;

  const resourceKey = address
    ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)!
    : singletonIndex;

  const mainBase = getComponentValue(
    components.MainBaseInitialized,
    resourceKey
  );

  //check if player has mainbase and checkpoint is null
  const playerInitialized = mainBase && checkpoint === null;

  return !playerInitialized && !completedTutorial;
};

export const validTutorialClick = (pos: Coord, network: Network) => {
  //get coords of arrow markers
  const markers = primodium.components
    .marker(network)
    .getOfType(BlockType.ArrowMarker);

  for (const marker of markers) {
    const markerPos = getComponentValue(network.components.Position, marker);
    if (coordEq(markerPos, pos)) {
      return true;
    }
  }

  return false;
};
