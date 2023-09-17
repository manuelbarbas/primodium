import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { hashAndTrimKeyEntity } from "src/util/encode";
import { useAccount } from "../../hooks/useAccount";
import { useMud } from "src/hooks/useMud";
import { useGameStore } from "../../store/GameStore";
import { getBuildingResearchRequirement } from "../../util/research";
import Spinner from "../shared/Spinner";
import { useMemo } from "react";
import { getRecipe } from "../../util/resource";
import {
  RESOURCE_SCALE,
  ResourceImage,
  ResourceType,
} from "../../util/constants";
import ResourceIconTooltip from "../shared/ResourceIconTooltip";
import { GameButton } from "../shared/GameButton";
import { upgradeBuilding } from "src/util/web3";
import {
  Level,
  P_MaxLevel,
  HasResearched,
  MainBase,
} from "src/network/components/chainComponents";
import { SingletonID } from "@latticexyz/network";
import { getBlockTypeName } from "src/util/common";

export default function UpgradeBuildingButton({
  id,
  coord,
  builtTile,
  buildingEntity,
}: {
  id: string;
  coord: Coord;
  builtTile: EntityID;
  buildingEntity: EntityID;
}) {
  const network = useMud();
  const { address } = useAccount();
  const [transactionLoading] = useGameStore((state) => [
    state.transactionLoading,
  ]);

  const currLevel = Level.use(buildingEntity);
  const maxLevel = P_MaxLevel.use(builtTile);
  const upgradedLevel = useMemo(() => {
    return parseInt(currLevel?.value.toString() ?? "0") + 1;
  }, [currLevel]);

  const isLevelConditionMet = useMemo(() => {
    return (currLevel?.value ?? 0) < (maxLevel?.value ?? 0);
  }, [currLevel, maxLevel]);

  const buildingTypeLevel = useMemo(() => {
    return hashAndTrimKeyEntity(
      builtTile,
      upgradedLevel as unknown as EntityID
    ) as EntityID;
  }, [upgradedLevel, builtTile]);

  const buildingTypeLastLevel = useMemo(() => {
    return hashAndTrimKeyEntity(
      builtTile,
      (upgradedLevel - 1) as unknown as EntityID
    ) as EntityID;
  }, [upgradedLevel, builtTile]);

  const lastLevelReceipe = useMemo(() => {
    return getRecipe(buildingTypeLastLevel);
  }, [buildingTypeLastLevel]);

  const recipe = useMemo(() => {
    return getRecipe(buildingTypeLevel);
  }, [buildingTypeLevel]);

  const differenceRecipee = useMemo(() => {
    if (!recipe || !lastLevelReceipe) return recipe;
    const difference = recipe.map((resource) => {
      let amount = resource.amount;
      if (resource.type == ResourceType.Utility) {
        let lastLevelResource = lastLevelReceipe.find(
          (lastLevelResource) => resource.id === lastLevelResource.id
        );

        if (lastLevelResource) {
          amount = resource.amount - lastLevelResource.amount;
        }
      }

      return {
        id: resource.id,
        amount: amount,
        type: resource.type,
      };
    });
    return difference;
  }, [recipe, lastLevelReceipe]);

  const researchRequirement = useMemo(() => {
    return getBuildingResearchRequirement(buildingTypeLevel);
  }, [buildingTypeLevel]);

  const researchOwner = useMemo(() => {
    if (!address || !researchRequirement) return SingletonID;
    return hashAndTrimKeyEntity(
      researchRequirement,
      address.toString().toLowerCase()
    ) as EntityID;
  }, [researchRequirement]);

  const isResearched = useMemo(() => {
    return HasResearched.get(researchOwner);
  }, [researchOwner]);

  const mainBaseEntity = MainBase.use(address, {
    value: "-1" as EntityID,
  }).value;

  const mainBaseLevel = Level.use(mainBaseEntity, {
    value: 0,
  }).value;
  const requiredMainBaseLevel = Level.use(buildingTypeLevel, {
    value: 0,
  }).value;

  const isMainBaseLevelRequirementsMet = useMemo(() => {
    return mainBaseLevel >= requiredMainBaseLevel;
  }, [mainBaseLevel, requiredMainBaseLevel]);

  const isUpgradeLocked = useMemo(() => {
    return (
      researchRequirement != undefined && !(isResearched && isResearched.value)
    );
  }, [isResearched, researchRequirement]);

  let upgradeText: string;
  if (isUpgradeLocked) {
    upgradeText = "Research Not Met";
  } else if (!isLevelConditionMet) {
    upgradeText = "Max Level Reached";
  } else if (isMainBaseLevelRequirementsMet) {
    upgradeText = "Upgrade Building Level " + upgradedLevel.toString();
  } else {
    upgradeText = "Lvl. " + requiredMainBaseLevel.toString() + " Base Required";
  }

  return (
    <div className="flex flex-col items-center">
      <GameButton
        id={id}
        className="w-44 text-sm"
        onClick={() => upgradeBuilding(coord, network)}
        color={
          isUpgradeLocked ||
          !isLevelConditionMet ||
          !isMainBaseLevelRequirementsMet
            ? "bg-gray-500"
            : undefined
        }
        disable={
          isUpgradeLocked ||
          !isLevelConditionMet ||
          !isMainBaseLevelRequirementsMet
        }
      >
        <div className="font-bold leading-none h-8 flex justify-center items-center px-2">
          {transactionLoading ? <Spinner /> : upgradeText}
        </div>
      </GameButton>
      <div className="mt-2 flex justify-center items-center text-sm bg-slate-900/60 px-2 space-x-2">
        {differenceRecipee.map((resource) => {
          const resourceImage = ResourceImage.get(resource.id)!;
          const resourceName = getBlockTypeName(resource.id);
          return (
            <ResourceIconTooltip
              key={resource.id}
              image={resourceImage}
              resourceId={resource.id}
              name={resourceName}
              scale={
                resource.type === ResourceType.Resource ? RESOURCE_SCALE : 1
              }
              amount={resource.amount}
            />
          );
        })}
      </div>
    </div>
  );
}
