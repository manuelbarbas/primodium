import { useState } from "react";

import BuildingMenuButton from "./building-icons/BuildingMenuButton";
import ChooseMinerMenu from "./ChooseMinerMenu";
import ChooseDebugMenu from "./ChooseDebugMenu";
import ChooseTransportMenu from "./ChooseTransportMenu";
import ChooseFactoryMenu from "./ChooseFactoryMenu";
import ChooseWeaponryMenu from "./ChooseWeaponryMenu";
import ChooseMainBaseMenu from "./ChooseMainbaseMenu";
import BuildingContentBox from "./BuildingBox";

//need a back button between pages
function BuildingPage() {
  const [menuOpenIndex, setMenuOpenIndex] = useState(-1);

  if (menuOpenIndex === 0) {
    return (
      <ChooseMainBaseMenu
        title="Build Main Base"
        setMenuOpenIndex={setMenuOpenIndex}
      />
    );
  } else if (menuOpenIndex === 1) {
    return (
      <ChooseMinerMenu
        title="Build Miners"
        setMenuOpenIndex={setMenuOpenIndex}
      />
    );
  } else if (menuOpenIndex === 2) {
    return (
      <ChooseTransportMenu
        title="Building path between nodes"
        setMenuOpenIndex={setMenuOpenIndex}
      />
    );
  } else if (menuOpenIndex === 3) {
    return (
      <ChooseFactoryMenu
        title="Build Factories"
        setMenuOpenIndex={setMenuOpenIndex}
      />
    );
  } else if (menuOpenIndex === 4) {
    return (
      <ChooseWeaponryMenu
        title="Build weaponry"
        setMenuOpenIndex={setMenuOpenIndex}
      />
    );
  } else if (menuOpenIndex === 5) {
    return (
      <ChooseDebugMenu title="Debug menu" setMenuOpenIndex={setMenuOpenIndex} />
    );
  } else {
    return (
      <BuildingContentBox>
        <p className="text-lg font-bold mb-3">Construct Buildings</p>
        <div className="grid grid-cols-4 h-48 gap-y-1 overflow-y-scroll scrollbar">
          <BuildingMenuButton
            icon={"/img/icons/mainbaseicon.png"}
            label={"Base"}
            menuIndex={0}
            menuOpenIndex={menuOpenIndex}
            setMenuOpenIndex={setMenuOpenIndex}
          ></BuildingMenuButton>
          <BuildingMenuButton
            icon={"/img/icons/minersicon.png"}
            label={"Miners"}
            menuIndex={1}
            menuOpenIndex={menuOpenIndex}
            setMenuOpenIndex={setMenuOpenIndex}
          ></BuildingMenuButton>
          <BuildingMenuButton
            icon={"/img/icons/transporticon.png"}
            label={"Transport"}
            menuIndex={2}
            menuOpenIndex={menuOpenIndex}
            setMenuOpenIndex={setMenuOpenIndex}
          ></BuildingMenuButton>
          <BuildingMenuButton
            icon={"/img/icons/factoriesicon.png"}
            label={"Factories"}
            menuIndex={3}
            menuOpenIndex={menuOpenIndex}
            setMenuOpenIndex={setMenuOpenIndex}
          ></BuildingMenuButton>
          <BuildingMenuButton
            icon={"/img/icons/weaponryicon.png"}
            label={"Weaponry"}
            menuIndex={4}
            menuOpenIndex={menuOpenIndex}
            setMenuOpenIndex={setMenuOpenIndex}
          ></BuildingMenuButton>
          {"true" === "true" && (
            <BuildingMenuButton
              icon={"/img/icons/debugicon.png"}
              label={"Debug"}
              menuIndex={5}
              menuOpenIndex={menuOpenIndex}
              setMenuOpenIndex={setMenuOpenIndex}
            ></BuildingMenuButton>
          )}
        </div>
      </BuildingContentBox>
    );
  }
}

export default BuildingPage;
