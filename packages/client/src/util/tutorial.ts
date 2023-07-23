import { Coord } from "@latticexyz/utils";
import { coordEq } from "@latticexyz/phaserx";

import { BlockType } from "./constants";
import { useTourStore } from "src/store/TourStore";
import { EntityID } from "@latticexyz/recs";
import { MainBase } from "src/network/components/chainComponents";
import { Marker, Position } from "src/network/components/clientComponents";

export const inTutorial = (address: EntityID) => {
  const completedTutorial = useTourStore.getState().completedTutorial;
  const checkpoint = useTourStore.getState().checkpoint;

  const mainBase = MainBase.get(address);

  //check if player has mainbase and checkpoint is null
  const playerInitialized = mainBase && checkpoint === null;

  return !playerInitialized && !completedTutorial;
};

export const validTutorialClick = (pos: Coord) => {
  //get coords of arrow markers
  const markers = Marker.getAllWith({ value: BlockType.ArrowMarker });

  for (const marker of markers) {
    const markerPos = Position.get(marker);
    if (coordEq(markerPos, pos)) {
      return true;
    }
  }

  return false;
};
