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

  // const recipe = useMemo(() => {
  //   return getRecipe(buildingTypeLevel, world, components);
  // }, [buildingTypeLevel]);

  const upgradeText = useMemo(() => {
    return "Upgrade Building to Level " + upgradedLevel.toString();
  }, [upgradedLevel]);

  const maxLevelReachedText = useMemo(() => {
    return "Max Level Reached";
  }, []);

  const technologyRequirementsNotMetText = useMemo(() => {
    return "Technology Requirements Not Met";
  }, []);

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

  const colorCode = useMemo(() => {
    return "bg-yellow-800 hover:bg-yellow-900";
  }, []);

  const claimAction = async () => {
    setTransactionLoading(true);
    await execute(
      systems["system.Upgrade"].executeTyped(coords, {
        gasLimit: 30_000_000,
      }),
      providers,
      setNotification
    );
    setTransactionLoading(false);
  };

  if (transactionLoading) {
    return (
      <div className="absolute inset-x-3 bottom-3">
        <button
          id={id}
          className={`h-10 ${colorCode} text-sm rounded font-bold w-full`}
        >
          <Spinner />
        </button>
      </div>
    );
  } else if (isUpgradeLocked) {
    return (
      <div className="absolute inset-x-3 bottom-3">
        <button
          id={id}
          className={`h-10 ${colorCode} text-sm rounded font-bold w-full`}
        >
          {technologyRequirementsNotMetText}
        </button>
      </div>
    );
  } else if (!isLevelConditionMet) {
    return (
      <div className="absolute inset-x-3 bottom-3">
        <button
          id={id}
          className={`h-10 ${colorCode} text-sm rounded font-bold w-full`}
        >
          {maxLevelReachedText}
        </button>
      </div>
    );
  } else {
    return (
      <div className="absolute inset-x-4 bottom-">
        <button
          id={id}
          className={`h-10 ${colorCode} text-sm rounded font-bold w-full`}
          onClick={claimAction}
        >
          {upgradeText}
          {/* <div className={`building-tooltip group-hover:scale-100`}>
            <div className="flex-col">
              {recipe.map((resource) => {
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
              })}
            </div>
          </div> */}
        </button>
      </div>
    );
  }
}
