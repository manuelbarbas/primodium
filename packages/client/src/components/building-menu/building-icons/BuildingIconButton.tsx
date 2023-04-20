import { useCallback } from "react";

import { EntityID } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { useMud } from "../../../context/MudContext";
import { useSelectedTile } from "../../../context/SelectedTileContext";
import { BlockColors } from "../../../util/constants";
import { BackgroundImage } from "../../../util/constants";

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

  const imageUrl = BackgroundImage.get(blockType);
  console.log("Image URL:", imageUrl);

  return (
    <button
      className="w-16 h-16 text-sm group"
      // style={{ backgroundColor: BlockColors.get(blockType) }}
      onClick={buildTile}
    >
      <div className="building-tooltip group-hover:scale-100">{label}</div>
      <img
        src={BackgroundImage.get(blockType)}
        className="w-16 h-16 pixel-images"
      ></img>
      <div className="h-2"></div>
    </button>
  );
}
export default BuildingIconButton;
