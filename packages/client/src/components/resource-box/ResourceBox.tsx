import { useState } from "react";
import { EntityID } from "@latticexyz/recs";
import { useComponentValue } from "@latticexyz/react";

import { FaMinusSquare } from "react-icons/fa";
import { FaPlusSquare } from "react-icons/fa";

import { useMud } from "../../context/MudContext";
import { useTransactionLoading } from "../../context/TransactionLoadingContext";
import { useAccount } from "../../hooks/useAccount";

import StarterPackButton from "../StarterPackButton";
import AllResourceLabels from "./AllResourceLabels";
import Spinner from "../Spinner";

function ResourceBox() {
  const [minimized, setMinimize] = useState(true);
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

  const { transactionLoading } = useTransactionLoading();

  if (transactionLoading) {
    return (
      <div className="z-[1000] fixed top-4 right-4 h-64 w-64 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className="mt-4 ml-5 flex flex-col h-56">
          <button onClick={minimizeBox} className="fixed right-9">
            <LinkIcon icon={<FaMinusSquare size="18" />} />
          </button>
          <p className="text-lg font-bold mb-3">Inventory</p>
          <Spinner />
        </div>
      </div>
    );
  } else if (!minimized) {
    return (
      <div className="z-[1000] fixed top-4 right-4 h-64 w-64 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className="mt-4 ml-5 flex flex-col h-56">
          <button onClick={minimizeBox} className="fixed right-9">
            <LinkIcon icon={<FaMinusSquare size="18" />} />
          </button>
          <p className="text-lg font-bold mb-3">Inventory</p>
          <div className="h-64 overflow-y-scroll scrollbar">
            <AllResourceLabels />
            {/* <p className="text-sm mb-3 mt-3">
              Close and re-open this box to refresh inventory.
            </p> */}
            {!claimedStarterPack ? <StarterPackButton /> : <></>}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="z-[1000] fixed top-4 right-4 h-14 w-64 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className="mt-4 ml-5 flex flex-col h-56">
          <button onClick={minimizeBox} className="fixed right-9">
            <LinkIcon icon={<FaPlusSquare size="18" />} />
          </button>
          <p className="text-lg font-bold mb-3">Inventory</p>
        </div>
      </div>
    );
  }
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block my-auto align-middle">{icon}</div>
);

export default ResourceBox;
