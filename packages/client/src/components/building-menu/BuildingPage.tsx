import { useState } from "react";

import BuildingMenuButton from "./building-icons/BuildingMenuButton";
import ChooseBuildingMenu from "./ChooseBuildingMenu";
import ChooseTransportMenu from "./ChooseTransportMenu";
import BuildingIconButton from "./building-icons/BuildingIconButton";
import { BlockType } from "../../util/constants";

//need a back button between pages
function BuildingPage() {
  const [menuOpenIndex, setMenuOpenIndex] = useState(-1);

  return (
    <div className="grid grid-cols-4 h-48 gap-y-1 overflow-y-scroll scrollbar">
      <BuildingMenuButton
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
      </BuildingMenuButton>
      <BuildingMenuButton
        icon={
          "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
        }
        text={"Transport"}
        menuIndex={1}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <ChooseTransportMenu
          title="Building path between nodes"
          setMenuOpenIndex={setMenuOpenIndex}
        />
      </BuildingMenuButton>
      <BuildingMenuButton
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
      </BuildingMenuButton>
      <BuildingMenuButton
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
      </BuildingMenuButton>
      {/* <BuildingMenuButton
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
      </BuildingMenuButton> */}
      {/* <BuildingMenuButton
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
      </BuildingMenuButton> */}
      <BuildingIconButton label="Miner" blockType={BlockType.Miner} />
      <BuildingIconButton label="Node" blockType={BlockType.Conveyer} />
      <BuildingIconButton label="Base" blockType={BlockType.MainBase} />
      <BuildingIconButton label="BulF" blockType={BlockType.BulletFactory} />
    </div>
  );
}

export default BuildingPage;
