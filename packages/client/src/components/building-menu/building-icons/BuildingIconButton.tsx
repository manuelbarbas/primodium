import { useCallback } from "react";
import { BigNumber } from "ethers";
import { EntityID } from "@latticexyz/recs";
import { getRevertReason } from "@latticexyz/network";
import { TransactionResponse } from "@ethersproject/providers";

import { useMud } from "../../../context/MudContext";
import { useSelectedTile } from "../../../context/SelectedTileContext";
import { BackgroundImage } from "../../../util/constants";

// Builds a specific blockType
function BuildingIconButton({
  label,
  blockType,
}: {
  label: string;
  blockType: EntityID;
}) {
  const { systems, providers } = useMud();
  const { selectedTile } = useSelectedTile();

  // Place action
  const buildTile = useCallback(async () => {
    try {
      const tx = await systems["system.Build"].executeTyped(
        BigNumber.from(blockType),
        selectedTile,
        {
          gasLimit: 3_000_000,
        }
      );
      await tx.wait();
    } catch (error: TransactionResponse | any) {
      const reason = await getRevertReason(
        error.transactionHash,
        providers.get().json
      );
      alert(reason);
    }
  }, [selectedTile]);

  return (
    <button
      className="w-16 h-16 text-sm group"
      // style={{ backgroundColor: BlockColors.get(blockType) }}
      onClick={buildTile}
    >
      <div className="building-tooltip group-hover:scale-100">
        {label}
        {/* todo: resource cost? tooltip? */}
      </div>
      <img
        src={BackgroundImage.get(blockType)}
        className="w-16 h-16 pixel-images"
      ></img>
      <div className="h-2"></div>
    </button>
  );
}
export default BuildingIconButton;
