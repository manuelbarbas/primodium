import { useCallback, useMemo } from "react";
import { EntityID, getComponentValue } from "@latticexyz/recs";
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
import { ResearchDefaultUnlocked } from "../../util/research";

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

  const isLocked = useMemo(() => {
    if (ResearchDefaultUnlocked.has(data.id)) return false;
    const researchOwner = address
      ? world.entityToIndex.get(
          hashKeyEntityAndTrim(
            data.id,
            address.toString().toLowerCase()
          ) as EntityID
        )!
      : singletonIndex;
    const isResearched = getComponentValue(components.Research, researchOwner);
    return !(isResearched && isResearched.value);
  }, []);

  const [transactionLoading, setTransactionLoading] = useGameStore((state) => [
    state.transactionLoading,
    state.setTransactionLoading,
  ]);
  const [setNotification] = useNotificationStore((state) => [
    state.setNotification,
  ]);

  const research = useCallback(async () => {
    setTransactionLoading(true);
    await execute(
      systems["system.Research"].executeTyped(BigNumber.from(data.id), {
        gasLimit: 1_000_000,
      }),
      providers,
      setNotification
    );
    setTransactionLoading(false);
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
      {!isLocked ? (
        <button className="text-white text-xs font-bold h-10 absolute inset-x-2 bottom-2 text-center bg-gray-600 py-2 rounded shadow">
          Unlocked
        </button>
      ) : (
        <button
          id={`${name}-research`}
          className="text-white text-xs font-bold h-10 absolute inset-x-2 bottom-2 text-center bg-teal-600 hover:bg-teal-700  py-2 rounded shadow"
          onClick={research}
        >
          {transactionLoading ? <Spinner /> : "Research"}
        </button>
      )}
    </div>
  );
}

export default TechTreeItem;
