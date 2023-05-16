import { useCallback, useMemo } from "react";
import { BigNumber } from "ethers";
import { EntityID } from "@latticexyz/recs";

import { useMud } from "../../../context/MudContext";
import { useSelectedTile } from "../../../context/SelectedTileContext";
import {
  BackgroundImage,
  BuildingResearchRequirements,
  BuildingResearchRequirementsDefaultUnlocked,
  ResourceImage,
} from "../../../util/constants";
import { execute } from "../../../network/actions";
import { BuildingReceipe } from "../../../util/resource";
import { useTransactionLoading } from "../../../context/TransactionLoadingContext";
import { useComponentValue } from "@latticexyz/react";
import { hashFromAddress } from "../../../util/encode";
import { useAccount } from "../../../hooks/useAccount";

// Builds a specific blockType
function BuildingIconButton({
  label,
  blockType,
}: {
  label: string;
  blockType: EntityID;
}) {
  const { components, systems, world, providers, singletonIndex } = useMud();
  const { selectedTile } = useSelectedTile();
  const { setTransactionLoading } = useTransactionLoading();

  const { address } = useAccount();

  // Check if building is unlocked per research or not
  const researchRequirement = BuildingResearchRequirements.get(blockType)![0];
  const researchOwner = address
    ? world.entityToIndex.get(
        hashFromAddress(
          researchRequirement,
          address.toString().toLowerCase()
        ) as EntityID
      )!
    : singletonIndex;
  const isResearched = useComponentValue(components.Research, researchOwner);

  const buildingLocked = useMemo(() => {
    return !(
      isResearched ||
      BuildingResearchRequirementsDefaultUnlocked.has(researchRequirement)
    );
  }, [isResearched, researchRequirement]);

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

  const cannotBuildTile = useCallback(() => {}, []);

  const recipe = BuildingReceipe.get(blockType);

  return (
    <button
      className="w-16 h-16 text-sm group"
      onClick={buildingLocked ? cannotBuildTile : buildTile}
    >
      <div
        className={`building-tooltip group-hover:scale-100 ${
          buildingLocked ? "text-red-500" : ""
        }`}
      >
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
      <div className="relative">
        <img
          src={BackgroundImage.get(blockType)}
          className="w-16 h-16 pixel-images hover:brightness-75"
        ></img>
        {buildingLocked && (
          <div
            style={{ backgroundColor: "rgba(240, 103, 100, 0.5)" }}
            className="absolute inset-0"
          />
        )}
      </div>
      <div className="h-2"></div>
    </button>
  );
}
export default BuildingIconButton;
