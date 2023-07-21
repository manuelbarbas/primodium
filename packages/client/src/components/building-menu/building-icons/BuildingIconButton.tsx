import { EntityID, getComponentValue } from "@latticexyz/recs";
import { useMemo } from "react";
import { useMud } from "../../../context/MudContext";
import { useAccount } from "../../../hooks/useAccount";
import {
  Action,
  BackgroundImage,
  ResourceImage,
} from "../../../util/constants";
import { hashKeyEntityAndTrim } from "../../../util/encode";
import { getBuildingResearchRequirement } from "../../../util/research";
import { getRecipe } from "../../../util/resource";
import {
  SelectedAction,
  SelectedBuilding,
} from "src/network/components/clientComponents";

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
  const network = useMud();
  const { components, world, singletonIndex } = network;

  const selectedBuilding = SelectedBuilding.use()?.value;

  const { address } = useAccount();

  const researchRequirement = useMemo(() => {
    return getBuildingResearchRequirement(blockType, world, components);
  }, [blockType]);

  const researchOwner = useMemo(() => {
    return address && researchRequirement
      ? world.entityToIndex.get(
          hashKeyEntityAndTrim(
            researchRequirement as EntityID,
            address.toString().toLowerCase()
          ) as EntityID
        )!
      : singletonIndex;
  }, [researchRequirement]);

  const isResearched = useMemo(() => {
    return getComponentValue(components.Research, researchOwner);
  }, [researchOwner]);

  // Check if building is unlocked per research or not
  const buildingLocked = useMemo(() => {
    return (
      researchRequirement != undefined && !(isResearched && isResearched.value)
    );
  }, [isResearched, researchRequirement]);

  const recipe = getRecipe(blockType, world, components);

  const handleSelectBuilding = () => {
    if (selectedBuilding === blockType) {
      SelectedBuilding.remove();
      SelectedAction.remove();
    } else {
      SelectedAction.set({ value: Action.PlaceBuilding });
      SelectedBuilding.remove();
    }
  };

  return (
    <button
      id={id}
      className="w-16 h-16 text-sm group"
      disabled={buildingLocked}
      onClick={handleSelectBuilding}
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
            selectedBuilding === blockType ? "border-4 border-yellow-300" : ""
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
