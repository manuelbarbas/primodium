import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { BytesLike } from "ethers";
import { Position } from "src/network/components/chainComponents";
import { Network } from "src/network/layer";
import { debugComponentDevSystem } from "src/util/web3/debug";

export const debug = (network: Network) => {
  const debugSetComponentValue = async (componentId: EntityID, entity: EntityID, value: BytesLike) => {
    await debugComponentDevSystem(componentId, entity, value, network);
  };

  const getEntityIdAtCoord = (coord: Coord) => {
    const entities = Position.getAllWith(coord);

    if (entities.length == 0) return;

    return entities[0];
  };

  return {
    debugSetComponentValue,
    getEntityIdAtCoord,
  };
};
