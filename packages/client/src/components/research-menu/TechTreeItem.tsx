import { useCallback, useMemo, useState } from "react";
import { EntityID, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";

import { useMud } from "../../context/MudContext";
import { ResourceCostData, getRecipe } from "../../util/resource";

import { BlockIdToKey, ResourceImage } from "../../util/constants";
import { useAccount } from "../../hooks/useAccount";
import { execute } from "../../network/actions";
import { hashKeyEntityAndTrim } from "../../util/encode";

import { useGameStore } from "../../store/GameStore";
import Spinner from "../Spinner";
import { useNotificationStore } from "../../store/NotificationStore";
import ResourceIconTooltip from "../shared/ResourceIconTooltip";
import { getBuildingResearchRequirement } from "../../util/research";
import { useComponentValue } from "@latticexyz/react";
import { encodeCoordEntityAndTrim } from "../../util/encode";
import { BlockType } from "../../util/constants";
function TechTreeItem({
  data,
  icon,
  name,
  description,
}: {
  data: ResourceCostData;
  icon: any;
  name: any;
  description: string;
}) {
  // fetch whether research is completed
  const { components, world, singletonIndex, systems, providers } = useMud();
  const { address } = useAccount();

  const isResearched = useComponentValue(
    components.Research,
    world.entityToIndex.get(
      hashKeyEntityAndTrim(
        data.id,
        address.toString().toLowerCase()
      ) as EntityID
    )
  );

  const researchRequirement = useMemo(() => {
    return getBuildingResearchRequirement(data.id, world, components);
  }, []);

  const researchOwner = useMemo(() => {
    return address != null && researchRequirement != null
      ? world.entityToIndex.get(
          hashKeyEntityAndTrim(
            researchRequirement as EntityID,
            address.toString().toLowerCase()
          ) as EntityID
        )!
      : singletonIndex;
  }, [researchRequirement, address]);

  const isResearchRequirementsMet = useMemo(() => {
    return (
      getComponentValue(components.Research, researchOwner)?.value ?? false
    );
  }, [researchOwner]);

  const mainBaseCoord = useComponentValue(
    components.MainBaseInitialized,
    world.entityToIndex.get(
      address.toString().toLowerCase() as EntityID
    ) as EntityIndex
  );
  const mainBaseEntity = useMemo(() => {
    return encodeCoordEntityAndTrim(
      { x: mainBaseCoord?.x ?? 0, y: mainBaseCoord?.y ?? 0 },
      BlockType.BuildingKey
    );
  }, [mainBaseCoord]);

  const mainBaseLevel = useComponentValue(
    components.BuildingLevel,
    world.entityToIndex.get(mainBaseEntity as EntityID) as EntityIndex
  );

  const requiredMainBaseLevel = useComponentValue(
    components.BuildingLevel,
    world.entityToIndex.get(data.id) as EntityIndex
  );

  const isMainBaseLevelRequirementsMet = useMemo(() => {
    return (mainBaseLevel?.value ?? 0) >= (requiredMainBaseLevel?.value ?? 0);
  }, [mainBaseLevel, requiredMainBaseLevel]);

  // Check if building can be researched
  const isLocked = useMemo(() => {
    return (
      (researchRequirement != null && !isResearchRequirementsMet) ||
      !isMainBaseLevelRequirementsMet
    );
  }, [
    isResearchRequirementsMet,
    researchRequirement,
    isMainBaseLevelRequirementsMet,
  ]);

  const [_, setTransactionLoading] = useGameStore((state) => [
    state.transactionLoading,
    state.setTransactionLoading,
  ]);
  const [setNotification] = useNotificationStore((state) => [
    state.setNotification,
  ]);

  // New state so not every other research item button shows loading when only current research button is clicked.
  const [userClickedLoading, setUserClickedLoading] = useState(false);

  const research = useCallback(async () => {
    setUserClickedLoading(true);
    setTransactionLoading(true);
    await execute(
      systems["system.Research"].executeTyped(BigNumber.from(data.id), {
        gasLimit: 1_000_000,
      }),
      providers,
      setNotification
    );
    setTransactionLoading(false);
    setUserClickedLoading(false);
  }, []);

  const recipe = getRecipe(data.id, world, components);

  return (
    <div className="relative min-w-64 h-72 pt-1 bg-gray-200 rounded shadow text-black mb-3 mr-3 p-3">
      <div className="mt-4 w-16 h-16 mx-auto">
        <img
          src={icon}
          className="w-16 h-16 mx-auto pixel-images bg-gray-300"
        ></img>
      </div>
      <div className="mt-4 text-center font-bold text-gray-900">{name}</div>
      <div className="mt-2 flex justify-center items-center text-sm">
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
      <div className="mt-3 text-xs">{description}</div>
      {isResearched?.value ?? false ? (
        <button className="text-white text-xs font-bold h-10 absolute inset-x-2 bottom-2 text-center bg-blue-600 py-2 rounded shadow">
          Researched
        </button>
      ) : isLocked ? (
        <button className="text-white text-xs font-bold h-10 absolute inset-x-2 bottom-2 text-center bg-gray-600 py-2 rounded shadow">
          Locked
        </button>
      ) : (
        <button
          id={`${name}-research`}
          className="text-white text-xs font-bold h-10 absolute inset-x-2 bottom-2 text-center bg-teal-600 hover:bg-teal-700  py-2 rounded shadow"
          onClick={research}
        >
          {userClickedLoading ? <Spinner /> : "Research"}
        </button>
      )}
    </div>
  );
}

export default TechTreeItem;
