import { EntityID } from "@latticexyz/recs";
import { Coord, uuid } from "@latticexyz/utils";
import { BuildingType, OwnedBy } from "src/network/components/chainComponents";
import { Position } from "src/network/components/clientComponents";
import { singletonIndex } from "src/network/world";

// Component overrides
export const addTileOverride = (
  pos: Coord,
  blockType: EntityID,
  player: EntityID
) => {
  const tempPositionId = uuid();
  const tempEntityIndex = singletonIndex;
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

  return { tempPositionId, tempEntityIndex };
};

export const removeTileOverride = (tempPositionId: string) => {
  Position.removeOverride(tempPositionId);
  BuildingType.removeOverride(tempPositionId);
};
