import { useCallback, useEffect } from "react";
import { useState } from "react";

import { EntityID } from "@latticexyz/recs";
import { BigNumber } from "ethers";

import MinerButton from "./building-icons/Miner";
import ConveyerButton from "./building-icons/Conveyer";
import BuildingButton from "../components/BuildingButton";
import ChooseBuildingMenu from "../components/ChooseBuildingMenu";
import ResearchBox from "../components/ResearchBox";

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
    const [menuOpenIndex, setMenuOpenIndex] = useState(-1);

    useEffect(() => {
      console.log("Open Index changed", menuOpenIndex);
    }, [menuOpenIndex]);

    return (
      <div className="grid grid-cols-4 h-48 gap-y-1 overflow-y-scroll scrollbar">
        <BuildingButton
          icon={
            "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
          }
          text={"Miners"}
          menuIndex={0}
          menuOpenIndex={menuOpenIndex}
          setMenuOpenIndex={setMenuOpenIndex}
        >
          <ChooseBuildingMenu title="Build Miners" />
        </BuildingButton>
        <BuildingButton
          icon={
            "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
          }
          text={"Transport"}
          menuIndex={1}
          menuOpenIndex={menuOpenIndex}
          setMenuOpenIndex={setMenuOpenIndex}
        >
          <ChooseBuildingMenu title="Build Transports" />
        </BuildingButton>
        <BuildingButton
          icon={
            "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
          }
          text={"Utility"}
          menuIndex={2}
          menuOpenIndex={menuOpenIndex}
          setMenuOpenIndex={setMenuOpenIndex}
        >
          <ChooseBuildingMenu title="Build Utilities" />
        </BuildingButton>
        <BuildingButton
          icon={
            "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
          }
          text={"Factories"}
          menuIndex={3}
          menuOpenIndex={menuOpenIndex}
          setMenuOpenIndex={setMenuOpenIndex}
        >
          <ChooseBuildingMenu title="Build Factories" />
        </BuildingButton>
        <BuildingButton
          icon={
            "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
          }
          text={"Weapons"}
          menuIndex={4}
          menuOpenIndex={menuOpenIndex}
          setMenuOpenIndex={setMenuOpenIndex}
        >
          <ChooseBuildingMenu title="Build Weapons" />
        </BuildingButton>
        <BuildingButton
          icon={
            "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
          }
          text={"Defenses"}
          menuIndex={5}
          menuOpenIndex={menuOpenIndex}
          setMenuOpenIndex={setMenuOpenIndex}
        >
          <ChooseBuildingMenu title="Build Defenses" />
        </BuildingButton>
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
