import { useState } from "react";

import { FaMinusSquare, FaPlusSquare } from "react-icons/fa";

import { useMud } from "../../context/MudContext";

import { primodium } from "@game/api";

import SelectedTile from "./SelectedTile";

function TooltipBox() {
  const network = useMud();

  const [minimized, setMinimize] = useState(true);

  const Icon = !minimized ? FaMinusSquare : FaPlusSquare;
  const selectedTile = primodium.hooks.useSelectedTile(network);

  return (
    <div
      className={`z-[1000] viewport-container fixed bottom-4 right-4 ${
        minimized ? "h-14 w-64" : "h-96 w-80"
      } flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded`}
    >
      <div
        className={`mt-4 ml-5 flex flex-col ${
          minimized ? "" : "overflow-y-scroll scrollbar h-[19rem]"
        }`}
      >
        <button
          id="minimize-button-tooltip-box"
          onClick={() => setMinimize(!minimized)}
          className="viewport-container fixed right-9"
        >
          <LinkIcon icon={<Icon size="18" />} />
        </button>
        {selectedTile &&
          (minimized ? (
            <p className="text-lg font-bold mb-3">
              Tile ({selectedTile.x}, {selectedTile.y})
            </p>
          ) : (
            <SelectedTile tile={selectedTile} />
          ))}
      </div>
    </div>
  );
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block my-auto align-middle">{icon}</div>
);

export default TooltipBox;
