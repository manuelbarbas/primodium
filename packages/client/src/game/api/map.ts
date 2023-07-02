import {
  EntityID,
  EntityIndex,
  getEntitiesWithValue,
  setComponent,
} from "@latticexyz/recs";
import { Coord, keccak256 } from "@latticexyz/utils";
import { Network } from "src/network/layer";

export const addHint = (coord: Coord, network: Network) => {
  const { world, offChainComponents, components } = network;

  const entities = getEntitiesWithValue(components.Position, coord);

  //check if there is an entity with given coord, if not create one and add position
  let entity: EntityIndex;
  if (!entities.size) {
    //create entity
    entity = world.registerEntity({
      id: keccak256(JSON.stringify(coord)) as EntityID,
      idSuffix: "_hint",
    });

    //add position
    setComponent(components.Position, entity, coord);
  } else {
    entity = entities.values().next().value;
  }

  setComponent(offChainComponents.Hint, entity, {
    value: true,
  });

  return entity;
};
