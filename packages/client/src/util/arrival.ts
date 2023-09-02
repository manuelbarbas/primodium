import { EntityID } from "@latticexyz/recs";
import {
  Arrival,
  ArrivalsIndex,
  ArrivalsSize,
} from "src/network/components/chainComponents";
import { ESendType } from "./web3/types";
import { hashKeyEntity } from "./encode";

export function getIndex(entity: EntityID) {
  const arrival = Arrival.getWithId(entity);
  if (!arrival) return;
  const playerAsteroidEntity =
    arrival.sendType == ESendType.REINFORCE
      ? hashKeyEntity(arrival.to, arrival.destination)
      : hashKeyEntity(arrival.from, arrival.destination);
  const size = ArrivalsSize.get(playerAsteroidEntity)?.value ?? 0;
  for (let i = 0; i < size + 1; i++) {
    const arrivalEntity = ArrivalsIndex.get(
      hashKeyEntity(playerAsteroidEntity, i)
    )?.value;
    if (arrivalEntity == entity) return i;
  }
  return;
}
