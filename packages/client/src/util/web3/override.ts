import { EntityID, EntityIndex } from "@latticexyz/recs";
import { Coord, uuid } from "@latticexyz/utils";
import {
  BuildingType,
  LastBuiltAt,
  LastClaimedAt,
  OwnedBy,
} from "src/network/components/chainComponents";
import { BlockNumber, Position } from "src/network/components/clientComponents";

// Component overrides
export const addTileOverride = (
  pos: Coord,
  blockType: EntityID,
  player: EntityID
) => {
  const tempPositionId = uuid();
  const tempEntityIndex = 34567543456 as EntityIndex;
  const blockNumber = BlockNumber.get(undefined, { value: 0 });
  Position.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: pos,
  });
  BuildingType.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: blockType },
  });
  OwnedBy.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: player },
  });
  LastBuiltAt.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: blockNumber,
  });
  LastClaimedAt.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: blockNumber,
  });

  return { tempPositionId, tempEntityIndex };
};

export const removeTileOverride = (tempPositionId: string) => {
  Position.removeOverride(tempPositionId);
  BuildingType.removeOverride(tempPositionId);
  OwnedBy.removeOverride(tempPositionId);
  LastBuiltAt.removeOverride(tempPositionId);
  LastClaimedAt.removeOverride(tempPositionId);
};
