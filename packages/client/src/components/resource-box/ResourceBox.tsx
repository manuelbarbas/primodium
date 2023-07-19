import { useComponentValue } from "@latticexyz/react";
import { EntityID } from "@latticexyz/recs";
import { useState } from "react";
import { FaMinusSquare, FaPlusSquare } from "react-icons/fa";

import { useMud } from "../../context/MudContext";
import { useAccount } from "../../hooks/useAccount";

import { useGameStore } from "../../store/GameStore";
import StarterPackButton from "../StarterPackButton";
import AllResourceLabels from "./AllResourceLabels";

function ResourceBox() {
  const [minimized, setMinimize] = useState(false);
  const minimizeBox = () => {
    if (minimized) {
      setMinimize(false);
    } else {
      setMinimize(true);
    }
  };

  // Check if user has claimed starter pack
  const { components, world, singletonIndex } = useMud();
  const { address } = useAccount();

  const claimedStarterPack = useComponentValue(
    components.StarterPackInitialized,
    address
      ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)
      : singletonIndex
  );

  //TODO: TEMP DISABLED FOR TUTORIAL
  const [transactionLoading] = useGameStore((state) => [
    state.transactionLoading,
  ]);
  const mainBuildingEntity = useComponentValue(
    components.MainBaseInitialized,
    address
      ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)
      : singletonIndex
  );

  const mainBuildingLevel = useComponentValue(
    components.BuildingLevel,
    world.entityToIndex.get(mainBuildingEntity?.value as unknown as EntityID)
  );

  const buildLimit = useComponentValue(
    components.BuildingLimit,
    world.entityToIndex.get(mainBuildingLevel?.value as unknown as EntityID)
  );

  const playerBuildingCount = useComponentValue(
    components.BuildingLimit,
    address
      ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)
      : singletonIndex
  );
  const buildLimitNumber = parseInt(buildLimit?.toString() ?? "0");
  const playerBuildingCountNumber = parseInt(
    playerBuildingCount?.value.toString() ?? "0"
  );

  if (transactionLoading) {
    return (
      <div className="z-[1000] viewport-container fixed top-4 right-4 h-64 w-80 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className="mt-4 ml-5 flex flex-col h-56">
          <button
            id="minimize-resource-box"
            onClick={minimizeBox}
            className="viewport-container fixed right-9"
          >
            <LinkIcon icon={<FaMinusSquare size="18" />} />
          </button>
          <p className="text-lg font-bold mb-3">
            Inventory {playerBuildingCountNumber} / {buildLimitNumber}
          </p>
          ...
          <div className="h-64 overflow-y-scroll scrollbar">
            {!claimedStarterPack ? <StarterPackButton /> : <></>}
          </div>
        </div>
      </div>
    );
  } else if (!minimized) {
    return (
      <div className="z-[1000] viewport-container fixed top-4 right-4 h-64 w-80 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className="mt-4 ml-5 flex flex-col h-56">
          <button
            id="minimize-resource-box"
            onClick={minimizeBox}
            className="viewport-container fixed right-9"
          >
            <LinkIcon icon={<FaMinusSquare size="18" />} />
          </button>
          <p className="text-lg font-bold mb-3">
            Inventory {playerBuildingCountNumber} / {buildLimitNumber}
          </p>
          <div className="h-64 overflow-y-scroll scrollbar">
            <AllResourceLabels />
            {!claimedStarterPack ? <StarterPackButton /> : <></>}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="pixel-corners-wrapper viewport-container fixed top-4 right-4 w-80">
        <div className="z-[1000] flex flex-col bg-gray-700 text-white shadow-xl font-mono pixel-corners p-10">
          <div className="flex">
            <p className="text-lg font-bold">
              Inventory {playerBuildingCountNumber} / {buildLimitNumber}
            </p>
            <button
              id="minimize-resource-box"
              onClick={minimizeBox}
              className=""
            >
              <LinkIcon icon={<FaPlusSquare size="18" />} />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block my-auto align-middle">{icon}</div>
);

export default ResourceBox;
