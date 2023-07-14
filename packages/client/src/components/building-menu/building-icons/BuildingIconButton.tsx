import { primodium } from "@game/api";
import {
  EntityID,
  getComponentValue,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
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
  const selectedBuilding = primodium.hooks.useSelectedBuilding(network);

  const { address } = useAccount();

  // Check if building is unlocked per research or not
  const isBuildingLocked = () => {
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
  };

  const recipe = getRecipe(blockType, world, components);
  const buildingLocked = isBuildingLocked();

  const handleSelectBuilding = () => {
    if (selectedBuilding === blockType) {
      primodium.components.selectedBuilding(network).remove();
      removeComponent(
        network.offChainComponents.SelectedAction,
        singletonIndex
      );
    } else {
      setComponent(network.offChainComponents.SelectedAction, singletonIndex, {
        value: Action.PlaceBuilding,
      });
      primodium.components.selectedBuilding(network).set(blockType);
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
