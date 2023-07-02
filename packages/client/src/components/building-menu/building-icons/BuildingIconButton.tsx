import { useCallback, useMemo } from "react";

import { EntityID, getComponentValue } from "@latticexyz/recs";

import { useMud } from "../../../context/MudContext";
import { BackgroundImage, ResourceImage } from "../../../util/constants";
import { getRecipe } from "../../../util/resource";
import { hashKeyEntityAndTrim } from "../../../util/encode";
import { useAccount } from "../../../hooks/useAccount";
import { useGameStore } from "../../../store/GameStore";
import { getBuildingResearchRequirement } from "../../../util/research";

// Builds a specific blockType
function BuildingIconButton({
  id,
  label,
  blockType,
}: {
  id?: string;
  label: string;
  blockType: EntityID;
}) {
  const { components, world, singletonIndex } = useMud();
  const [
    setSelectedBlock,
    selectedBlock,
    setStartSelectedPathTile,
    setEndSelectedPathTile,
  ] = useGameStore((state) => [
    state.setSelectedBlock,
    state.selectedBlock,
    state.setStartSelectedPathTile,
    state.setEndSelectedPathTile,
  ]);

  const { address } = useAccount();

  // Check if building is unlocked per research or not
  const buildingLocked = useMemo(() => {
    const researchRequirement = getBuildingResearchRequirement(
      blockType,
      world,
      components
    );

    if (!researchRequirement) {
      return false;
    }
    const researchOwner = address
      ? world.entityToIndex.get(
          hashKeyEntityAndTrim(
            researchRequirement,
            address.toString().toLowerCase()
          ) as EntityID
        )!
      : singletonIndex;
    const isResearched = getComponentValue(components.Research, researchOwner);

    return !(isResearched && isResearched.value);
  }, []);

  const cannotBuildTile = useCallback(() => {}, []);

  const recipe = getRecipe(blockType, world, components);

  return (
    <button
      id={id}
      className="w-16 h-16 text-sm group"
      onClick={
        buildingLocked
          ? cannotBuildTile
          : () => {
              //set selected block, if clicked again deselect
              selectedBlock === blockType
                ? setSelectedBlock(null)
                : setSelectedBlock(blockType);
              setStartSelectedPathTile(null);
              setEndSelectedPathTile(null);
            }
      }
    >
      <div
        className={`building-tooltip group-hover:scale-100 ${
          buildingLocked ? "text-red-500" : ""
        }`}
      >
        {label}
        <div className="flex-col">
          {recipe ? (
            recipe.map((resource) => {
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
          className={`"w-16 h-16 pixel-images hover:brightness-75 ${
            selectedBlock === blockType ? "border-4 border-yellow-300" : ""
          }`}
        />
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
