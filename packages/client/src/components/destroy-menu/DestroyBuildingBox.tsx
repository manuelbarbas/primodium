import { useCallback } from "react";
import { useState } from "react";

import { DisplayTile } from "../../util/constants";

import DestroyTileButton from "./DestroyTileButton";

import { useSelectedTile } from "../../context/SelectedTileContext";
import { useMud } from "../../context/MudContext";

import { FaWindowClose } from "react-icons/fa";

function DestroyBuildingBox() {
  const { systems } = useMud();
  const { selectedTile } = useSelectedTile();

  const destroyTile = useCallback(({ x, y }: DisplayTile) => {
    systems["system.Destroy"].executeTyped(
      {
        x: x,
        y: y,
      },
      {
        gasLimit: 1_000_000,
      }
    );
  }, []);

  // Helpers
  const destroyTileHelper = useCallback(() => {
    destroyTile(selectedTile);
  }, [selectedTile]);

  const [minimized, setMinimize] = useState(false);

  const minimizeBox = () => {
    if (minimized) {
      setMinimize(false);
    } else {
      setMinimize(true);
    }
  };
  if (!minimized) {
    return (
      <div className="z-[1000] fixed bottom-4 left-20 h-72 w-96 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
        <div className=" mt-4 ml-5 flex flex-col h-72">
          <button onClick={minimizeBox} className="fixed top-4 right-5">
            <LinkIcon icon={<FaWindowClose size="24" />} />
          </button>
          <p className="text-lg font-bold mb-3">Demolish Buildings</p>
          <p>
            First select a tile on the map, then click on "Demolish" to remove
            the building.
          </p>
          <DestroyTileButton action={destroyTileHelper} />
        </div>
      </div>
    );
  } else {
    return <div></div>;
  }
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block align-middle">{icon}</div>
);

export default DestroyBuildingBox;
