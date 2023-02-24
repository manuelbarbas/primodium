import { useState } from "react";

import BuildingMenuButton from "./building-icons/BuildingMenuButton";
import ChooseBuildingMenu from "../components/ChooseBuildingMenu";

function ResearchPage() {
  const [menuOpenIndex, setMenuOpenIndex] = useState(-1);

  return (
    <div className="grid grid-cols-4 h-48 gap-y-1 overflow-y-scroll scrollbar">
      <BuildingMenuButton
        icon={
          "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
        }
        text={"Mining"}
        menuIndex={0}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <ChooseBuildingMenu
          title="Mining Technologies"
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
        <ChooseBuildingMenu
          title="Transportation technologies"
          setMenuOpenIndex={setMenuOpenIndex}
        />
      </BuildingMenuButton>
      <BuildingMenuButton
        icon={
          "https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"
        }
        text={"Defenses"}
        menuIndex={2}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <ChooseBuildingMenu
          title="Defense technologies"
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
          title="Manufacturing technologies"
          setMenuOpenIndex={setMenuOpenIndex}
        />
      </BuildingMenuButton>
    </div>
  );
}
export default ResearchPage;
