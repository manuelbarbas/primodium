import { useCallback } from "react";

import { EntityID } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { useMud } from "../../../context/MudContext";
import { useSelectedTile } from "../../../context/SelectedTileContext";
import { BlockColors } from "../../../util/constants";

// Builds a specific blockType
function BuildingIconButton({
  label,
  blockType,
}: {
  label: string;
  blockType: EntityID;
}) {
  const { systems } = useMud();
  const { selectedTile } = useSelectedTile();

  // Place action
  const buildTile = useCallback(() => {
    systems["system.Build"].executeTyped(
      BigNumber.from(blockType),
      selectedTile,
      {
        gasLimit: 3_000_000,
      }
    );
  }, [selectedTile]);

  return (
    <button
      className="w-16 h-16"
      style={{ backgroundColor: BlockColors.get(blockType) }}
      onClick={buildTile}
    >
      {label}
    </button>
  );
}
export default BuildingIconButton;
