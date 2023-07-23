import { useComponentValue } from "src/hooks/useComponentValue";
import { EntityID, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { hashKeyEntityAndTrim } from "src/util/encode";
import { useMud } from "../../context/MudContext";
import { useAccount } from "../../hooks/useAccount";
import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";
import { useNotificationStore } from "../../store/NotificationStore";
import { getBuildingResearchRequirement } from "../../util/research";
import Spinner from "../Spinner";
import { useMemo } from "react";
import { getRecipe } from "../../util/resource";
import { ResourceImage } from "../../util/constants";
import ResourceIconTooltip from "../shared/ResourceIconTooltip";
import { BlockIdToKey } from "../../util/constants";
import { GameButton } from "../shared/GameButton";

export default function UpgradeButton({
  id,
  coords,
  builtTile,
  buildingEntity,
}: {
  id: string;
  coords: Coord;
  builtTile: EntityID;
  buildingEntity: EntityID;
}) {
  const { systems, providers, components, world, singletonIndex } = useMud();
  const { address } = useAccount();
  const [transactionLoading, setTransactionLoading] = useGameStore((state) => [
    state.transactionLoading,
    state.setTransactionLoading,
  ]);
  const [setNotification] = useNotificationStore((state) => [
    state.setNotification,
  ]);

  const currLevel = useComponentValue(
    components.BuildingLevel,
    world.entityToIndex.get(buildingEntity) as EntityIndex
  );
  const maxLevel = useComponentValue(
    components.MaxLevel,
    world.entityToIndex.get(builtTile) as EntityIndex
  );
  const upgradedLevel = useMemo(() => {
    return parseInt(currLevel?.value.toString() ?? "0") + 1;
  }, [currLevel]);

  const isLevelConditionMet = useMemo(() => {
    return (currLevel?.value ?? 0) < (maxLevel?.value ?? 0);
  }, [currLevel, maxLevel]);

  const buildingTypeLevel = useMemo(() => {
    return hashKeyEntityAndTrim(
      builtTile,
      upgradedLevel as unknown as EntityID
    ) as EntityID;
  }, [currLevel, builtTile]);

  const recipe = useMemo(() => {
    return getRecipe(buildingTypeLevel, world, components);
  }, [buildingTypeLevel]);

  // const upgradeText = useMemo(() => {
  //   return "Upgrade Building to Level " + upgradedLevel.toString();
  // }, [upgradedLevel]);

  // const maxLevelReachedText = useMemo(() => {
  //   return "Max Level Reached";
  // }, []);

  // const technologyRequirementsNotMetText = useMemo(() => {
  //   return "Technology Requirements Not Met";
  // }, []);

  const researchRequirement = useMemo(() => {
    return getBuildingResearchRequirement(buildingTypeLevel, world, components);
  }, [buildingTypeLevel]);

  const researchOwner = useMemo(() => {
    return address && researchRequirement
      ? world.entityToIndex.get(
          hashKeyEntityAndTrim(
            researchRequirement,
            address.toString().toLowerCase()
          ) as EntityID
        )!
      : singletonIndex;
  }, [researchRequirement]);

  const isResearched = useMemo(() => {
    return getComponentValue(components.Research, researchOwner);
  }, [researchOwner]);

  const isUpgradeLocked = useMemo(() => {
    return (
      researchRequirement != undefined && !(isResearched && isResearched.value)
    );
  }, [isResearched, researchRequirement]);

  const claimAction = async () => {
    setTransactionLoading(true);
    await execute(
      systems["system.Upgrade"].executeTyped(coords, {
        gasLimit: 29_000_000,
      }),
      providers,
      setNotification
    );
    setTransactionLoading(false);
  };

  let upgradeText: string;
  if (isUpgradeLocked) {
    upgradeText = "Research Not Met";
  } else if (!isLevelConditionMet) {
    upgradeText = "Max Level Reached";
  } else {
    upgradeText = "Upgrade Building to Level " + upgradedLevel.toString();
  }

  return (
    <div className="flex flex-col items-center">
      <GameButton
        id={id}
        className="w-44 mt-2 text-sm"
        onClick={claimAction}
        color={
          isUpgradeLocked || !isLevelConditionMet ? "bg-gray-500" : undefined
        }
        disable={isUpgradeLocked || !isLevelConditionMet}
      >
        <div className="font-bold leading-none h-8 flex justify-center items-center crt">
          {transactionLoading ? <Spinner /> : upgradeText}
        </div>
      </GameButton>
      <div className="mt-2 flex justify-center items-center text-sm bg-slate-900/60 px-2">
        {recipe.map((resource) => {
          const resourceImage = ResourceImage.get(resource.id)!;
          const resourceName = BlockIdToKey[resource.id];
          return (
            <ResourceIconTooltip
              key={resource.id}
              image={resourceImage}
              resourceId={resource.id}
              name={resourceName}
              amount={resource.amount}
            />
          );
        })}
      </div>
    </div>
  );
}
