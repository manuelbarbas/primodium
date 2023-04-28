import { useState } from "react";

import BuildingMenuButton from "./building-icons/BuildingMenuButton";
import ChooseMinerMenu from "./ChooseMinerMenu";
import ChooseDebugMenu from "./ChooseDebugMenu";
import ChooseTransportMenu from "./ChooseTransportMenu";
import ChooseFactoryMenu from "./ChooseFactoryMenu";
import ChooseWeaponryMenu from "./ChooseWeaponryMenu";
import ChooseMainBaseMenu from "./ChooseMainbaseMenu";

//need a back button between pages
function BuildingPage() {
  const [menuOpenIndex, setMenuOpenIndex] = useState(-1);

  return (
    <div className="grid grid-cols-4 h-48 gap-y-1 overflow-y-scroll scrollbar">
      <BuildingMenuButton
        icon={"/img/icons/mainbaseicon.png"}
        text={"Base"}
        menuIndex={0}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <ChooseMainBaseMenu
          title="Build Main Base"
          setMenuOpenIndex={setMenuOpenIndex}
        />
      </BuildingMenuButton>
      <BuildingMenuButton
        icon={"/img/icons/minersicon.png"}
        text={"Miners"}
        menuIndex={1}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <ChooseMinerMenu
          title="Build Miners"
          setMenuOpenIndex={setMenuOpenIndex}
        />
      </BuildingMenuButton>
      <BuildingMenuButton
        icon={"/img/icons/transporticon.png"}
        text={"Transport"}
        menuIndex={2}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <ChooseTransportMenu
          title="Building path between nodes"
          setMenuOpenIndex={setMenuOpenIndex}
        />
      </BuildingMenuButton>
      <BuildingMenuButton
        icon={"/img/icons/factoriesicon.png"}
        text={"Factories"}
        menuIndex={3}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <ChooseFactoryMenu
          title="Build Factories"
          setMenuOpenIndex={setMenuOpenIndex}
        />
      </BuildingMenuButton>
      <BuildingMenuButton
        icon={"/img/icons/weaponryicon.png"}
        text={"Weaponry"}
        menuIndex={4}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <ChooseWeaponryMenu
          title="Build weaponry"
          setMenuOpenIndex={setMenuOpenIndex}
        />
      </BuildingMenuButton>
      {import.meta.env.VITE_DEV === "true" && (
        <BuildingMenuButton
          icon={"/img/icons/debugicon.png"}
          text={"Debug"}
          menuIndex={5}
          menuOpenIndex={menuOpenIndex}
          setMenuOpenIndex={setMenuOpenIndex}
        >
          <ChooseDebugMenu
            title="Debug menu"
            setMenuOpenIndex={setMenuOpenIndex}
          />
        </BuildingMenuButton>
      )}
    </div>
  );
}

export default BuildingPage;
