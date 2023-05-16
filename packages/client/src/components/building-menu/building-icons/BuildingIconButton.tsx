import { useCallback } from "react";
import { BigNumber } from "ethers";
import { EntityID } from "@latticexyz/recs";

import { useMud } from "../../../context/MudContext";
import { useSelectedTile } from "../../../context/SelectedTileContext";
import { BackgroundImage, ResourceImage } from "../../../util/constants";
import { execute } from "../../../network/actions";
import { BuildingReceipe } from "../../../util/resource";
import { useTransactionLoading } from "../../../context/TransactionLoadingContext";

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
  const { setTransactionLoading } = useTransactionLoading();

  // Place action
  const buildTile = useCallback(async () => {
    setTransactionLoading(true);
    await execute(
      systems["system.Build"].executeTyped(
        BigNumber.from(blockType),
        selectedTile,
        {
          gasLimit: 1_800_000,
        }
      ),
      providers
    );
    setTransactionLoading(false);
  }, [selectedTile]);

  const recipe = BuildingReceipe.get(blockType);

  return (
    <button className="w-16 h-16 text-sm group" onClick={buildTile}>
      <div className="building-tooltip group-hover:scale-100">
        {label}
        <div className="flex-col">
          {recipe ? (
            recipe[0].resources.map((resource) => {
              const resourceImage = ResourceImage.get(resource.id);
              return (
                <div className="mr-2 inline-block" key={resource.id}>
                  <img
                    src={resourceImage}
                    className="w-4 h-4 inline-block mr-1 pixel-images"
                  />
                  {resource.amount}
                </div>
              );
            })
          ) : (
            <></>
          )}
        </div>
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
