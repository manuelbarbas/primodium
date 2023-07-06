import { useState, useCallback, ReactNode, useEffect } from "react";

import { IoHammerSharp, IoFlaskSharp } from "react-icons/io5";
import { TbBulldozer, TbSword, TbScale } from "react-icons/tb";

import MarketModal from "./market-menu/MarketModal";
import BuildingPage from "./building-menu/BuildingPage";
import DemolishBuildingBox from "./demolish-menu/DemolishBuildingBox";
import ResearchModal from "./research-menu/ResearchModal";
import AttackBox from "./attack-menu/AttackBox";
import { useMud } from "src/context/MudContext";
import { primodium } from "@game/api";

import { useTourStore } from "../store/TourStore";

function SideBarIcon({
  id,
  icon,
  text,
  menuIndex,
  menuOpenIndex,
  setMenuOpenIndex,
  children,
}: {
  id?: string;
  icon: any;
  text: string;
  menuIndex: number;
  menuOpenIndex: number;
  setMenuOpenIndex: React.Dispatch<React.SetStateAction<number>>;
  children?: ReactNode;
}) {
  const network = useMud();

  const setMenuOpenIndexHelper = useCallback(() => {
    if (menuIndex !== menuOpenIndex) {
      setMenuOpenIndex(menuIndex);
    } else {
      setMenuOpenIndex(-1);
    }

    // Remove selected building if menu is changed
    primodium.components.selectedBuilding(network).remove();
  }, [menuIndex, menuOpenIndex]);

  return (
    <div id={id}>
      <button className="sidebar-icon group" onClick={setMenuOpenIndexHelper}>
        {icon}
        {menuIndex !== menuOpenIndex && (
          <div className="sidebar-tooltip group-hover:scale-100">
            {text}
            {/* TODO: resource cost for building + maybe info? */}
          </div>
        )}
      </button>
      {menuIndex === menuOpenIndex && children}
    </div>
  );
}

function SideMenu() {
  // Only show one element at a time
  // -1 means menu not selected at all.
  const [menuOpenIndex, setMenuOpenIndex] = useState(-1);
  const [checkpoint] = useTourStore((state) => [state.checkpoint]);

  //TODO: temp fix for tour. Menu will reset on checkpoint change.
  useEffect(() => {
    setMenuOpenIndex(-1);
  }, [checkpoint]);

  return (
    <div className="z-[1000] viewport-container fixed bottom-4 left-4 selection:font-mono text-white">
      <SideBarIcon
        id="build"
        icon={<IoHammerSharp size="24" />}
        text={"Build"}
        menuIndex={0}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <BuildingPage />
      </SideBarIcon>
      <SideBarIcon
        id="research"
        icon={<IoFlaskSharp size="24" />}
        text="Research"
        menuIndex={1}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <ResearchModal setMenuOpenIndex={setMenuOpenIndex} />
      </SideBarIcon>
      <SideBarIcon
        id="trade"
        icon={<TbScale size="24" />}
        text="Trade"
        menuIndex={2}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <MarketModal setMenuOpenIndex={setMenuOpenIndex} />
      </SideBarIcon>
      <SideBarIcon
        id="attack"
        icon={<TbSword size="24" />}
        text="Attack"
        menuIndex={3}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <AttackBox />
      </SideBarIcon>
      <SideBarIcon
        id="demolish"
        icon={<TbBulldozer size="24" />}
        text="Demolish"
        menuIndex={4}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <DemolishBuildingBox />
      </SideBarIcon>
    </div>
  );
}

export default SideMenu;
