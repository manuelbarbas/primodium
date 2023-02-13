import { useCallback } from "react";
import { useState } from "react";

import { EntityID } from "@latticexyz/recs";
import { BigNumber } from "ethers";

import MinerButton from "./building-icons/Miner";
import ConveyerButton from "./building-icons/Conveyer";
import BuildingButton from "../components/BuildingButton";

import { BlockType, DisplayTile } from "../util/constants";

import { useSelectedTile } from "../context/SelectedTileContext";
import { useMud } from "../context/MudContext";

import { FaWindowClose } from "react-icons/fa";

function BuildingBox() {
  const { systems } = useMud();
  const { selectedTile } = useSelectedTile();

  // Place action
  const buildTile = useCallback(
    ({ x, y }: DisplayTile, blockType: EntityID) => {
      console.log("building on tile");
      console.log(x, y);
      systems["system.Build"].executeTyped(
        BigNumber.from(blockType),
        {
          x: x,
          y: y,
        },
        {
          gasLimit: 1_000_000,
        }
      );
    },
    []
  );

  // Helpers
  const buildMinerHelper = useCallback(() => {
    buildTile(selectedTile, BlockType.LithiumMiner);
  }, [selectedTile]);

  const buildConveyerHelper = useCallback(() => {
    buildTile(selectedTile, BlockType.Conveyer);
  }, [selectedTile]);

  //need a back button between pages
  function BuildingPage() {
    return (
      <div className="grid grid-cols-4 h-48 gap-y-1 overflow-y-scroll scrollbar">
        <BuildingButton
          icon={
            "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
          }
          text={"Miners"}
        />
        <BuildingButton
          icon={
            "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
          }
          text={"Transport"}
        />
        <BuildingButton
          icon={
            "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
          }
          text={"Utility"}
        />
        <BuildingButton
          icon={
            "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
          }
          text={"Factories"}
        />
        <BuildingButton
          icon={
            "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
          }
          text={"Weapons"}
        />
        <BuildingButton
          icon={
            "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
          }
          text={"Defenses"}
        />
        <MinerButton action={buildMinerHelper} />
        <ConveyerButton action={buildConveyerHelper} />
      </div>
    );
  }

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
          <p className="text-lg font-bold mb-3">Construct Buildings</p>
          <button onClick={minimizeBox} className="fixed top-4 right-5">
            <LinkIcon icon={<FaWindowClose size="24" />} />
          </button>
          <BuildingPage />
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

export default BuildingBox;
