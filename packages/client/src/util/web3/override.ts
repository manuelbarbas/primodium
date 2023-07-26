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
  Position.override.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: pos,
  });
  BuildingType.override.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: blockType },
  });
  OwnedBy.override.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: player },
  });
  LastBuiltAt.override.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: blockNumber,
  });
  LastClaimedAt.override.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: blockNumber,
  });

  return { tempPositionId, tempEntityIndex };
};

export const removeTileOverride = (tempPositionId: string) => {
  Position.override.removeOverride(tempPositionId);
  BuildingType.override.removeOverride(tempPositionId);
  OwnedBy.override.removeOverride(tempPositionId);
  LastBuiltAt.override.removeOverride(tempPositionId);
  LastClaimedAt.override.removeOverride(tempPositionId);
};
