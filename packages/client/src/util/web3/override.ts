import { EntityID, EntityIndex } from "@latticexyz/recs";
import { Coord, uuid } from "@latticexyz/utils";
import { Network } from "src/network/layer";

// Component overrides
export const addTileOverride = (
  pos: Coord,
  blockType: EntityID,
  address: string,
  network: Network
) => {
  const { components, providers } = network;
  const tempPositionId = uuid();
  const tempEntityIndex = 34567543456 as EntityIndex;
  components.Position.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: pos,
  });
  components.BuildingType.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: blockType },
  });
  components.OwnedBy.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: address },
  });
  components.LastBuiltAt.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: providers.get().ws?.blockNumber || 0 },
  });
  components.LastClaimedAt.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: providers.get().ws?.blockNumber || 0 },
  });

  return { tempPositionId, tempEntityIndex };
};

export const removeTileOverride = (
  tempPositionId: string,
  network: Network
) => {
  const { components } = network;

  components.Position.removeOverride(tempPositionId);
  components.BuildingType.removeOverride(tempPositionId);
  components.OwnedBy.removeOverride(tempPositionId);
  components.LastBuiltAt.removeOverride(tempPositionId);
  components.LastClaimedAt.removeOverride(tempPositionId);
};
