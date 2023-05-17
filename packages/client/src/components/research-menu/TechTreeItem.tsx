import { useCallback, useMemo } from "react";
import { useComponentValue } from "@latticexyz/react";
import { EntityID } from "@latticexyz/recs";
import { BigNumber } from "ethers";

import { useMud } from "../../context/MudContext";
import { ResourceCostData } from "../../util/resource";

import { BuildingResearchRequirementsDefaultUnlocked } from "../../util/constants";
import { useAccount } from "../../hooks/useAccount";
import { execute } from "../../network/actions";
import { hashFromAddress } from "../../util/encode";
import { useTransactionLoading } from "../../context/TransactionLoadingContext";
import Spinner from "../Spinner";

function TechTreeItem({
  data,
  icon,
  name,
  description,
  resourcecost,
}: {
  data: ResourceCostData;
  icon: any;
  name: any;
  description: string;
  resourcecost: JSX.Element[];
}) {
  // fetch whether research is completed
  const { components, world, singletonIndex, systems, providers } = useMud();
  const { address } = useAccount();

  // const researchOwner = useMemo(() => {
  //   if (address) {
  //     const encodedEntityId = hashFromAddress(
  //       data.id,
  //       address.toString().toLowerCase()
  //     ) as EntityID;
  //     return world.entityToIndex.get(encodedEntityId)!;
  //   } else {
  //     return singletonIndex;
  //   }
  // }, [address, singletonIndex, world]);

  const researchOwner = address
    ? world.entityToIndex.get(
        hashFromAddress(data.id, address.toString().toLowerCase()) as EntityID
      )!
    : singletonIndex;

  const isDefaultUnlocked = BuildingResearchRequirementsDefaultUnlocked.has(
    data.id
  );
  const isResearched = useComponentValue(components.Research, researchOwner);

  const isUnlocked = useMemo(() => {
    return isDefaultUnlocked || isResearched?.value;
  }, [isDefaultUnlocked, isResearched]);

  const { transactionLoading, setTransactionLoading } = useTransactionLoading();

  const research = useCallback(async () => {
    setTransactionLoading(true);
    await execute(
      systems["system.Research"].executeTyped(BigNumber.from(data.id), {
        gasLimit: 1_000_000,
      }),
      providers
    );
    setTransactionLoading(false);
  }, []);

  return (
    <div className="relative group min-w-64 h-72 pt-1 bg-gray-200 rounded shadow text-black mb-3 mr-3 p-3">
      <div className="mt-4 w-16 h-16 mx-auto">
        <img
          src={icon}
          className="w-16 h-16 mx-auto pixel-images bg-gray-300"
        ></img>
      </div>
      <div className="mt-4 text-center font-bold text-gray-900">{name}</div>
      <div className="mt-2 flex justify-center items-center text-sm">
        {resourcecost}
      </div>
      <div className="mt-3 text-xs">{description}</div>
      {isUnlocked ? (
        <button className="text-white text-xs font-bold h-10 absolute inset-x-2 bottom-2 text-center bg-gray-600 py-2 rounded shadow">
          Unlocked
        </button>
      ) : (
        <button
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
