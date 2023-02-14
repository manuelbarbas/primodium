import { useEffect } from "react";
import { useState } from "react";

import MinerButton from "./building-icons/Miner";
import ConveyerButton from "./building-icons/Conveyer";
import BuildingButton from "./BuildingMenuButton";
import ChooseBuildingMenu from "../components/ChooseBuildingMenu";
import ChooseTransportMenu from "./ChooseTransportMenu";

//need a back button between pages
function BuildingPage({
  buildMinerHelper,
  buildConveyerHelper,
}: {
  buildMinerHelper: () => void;
  buildConveyerHelper: () => void;
}) {
  const [menuOpenIndex, setMenuOpenIndex] = useState(-1);

  useEffect(() => {
    console.log("Open Index changed here", menuOpenIndex);
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
        <ChooseBuildingMenu
          title="Build Miners"
          setMenuOpenIndex={setMenuOpenIndex}
        />
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
        <ChooseTransportMenu
          title="Build Transports"
          setMenuOpenIndex={setMenuOpenIndex}
        />
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
        <ChooseBuildingMenu
          title="Build Utilities"
          setMenuOpenIndex={setMenuOpenIndex}
        />
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
        <ChooseBuildingMenu
          title="Build Factories"
          setMenuOpenIndex={setMenuOpenIndex}
        />
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
        <ChooseBuildingMenu
          title="Build Weapons"
          setMenuOpenIndex={setMenuOpenIndex}
        />
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
        <ChooseBuildingMenu
          title="Build Defenses"
          setMenuOpenIndex={setMenuOpenIndex}
        />
      </BuildingButton>
      <MinerButton action={buildMinerHelper} />
      <ConveyerButton action={buildConveyerHelper} />
    </div>
  );
}

export default BuildingPage;
