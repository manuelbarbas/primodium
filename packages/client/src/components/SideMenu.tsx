import { useState, useCallback, ReactNode } from "react";

import { IoHammerSharp } from "react-icons/io5";
import { IoFlaskSharp } from "react-icons/io5";
import { TbBulldozer } from "react-icons/tb";
import { TbSword } from "react-icons/tb";
import { TbScale } from "react-icons/tb";

import AttackBox from "./attack-menu/AttackBox";
import MarketModal from "./market-menu/MarketModal";
import BuildingPage from "./building-menu/BuildingPage";
import DestroyBuildingBox from "./destroy-menu/DestroyBuildingBox";
// import { useSelectedTile } from "../context/SelectedTileContext";
import ResearchModal from "./research-menu/ResearchModal";
import { useGameStore } from "../store/GameStore";

function SideBarIcon({
  icon,
  text,
  menuIndex,
  menuOpenIndex,
  setMenuOpenIndex,
  children,
}: {
  icon: any;
  text: string;
  menuIndex: number;
  menuOpenIndex: number;
  setMenuOpenIndex: React.Dispatch<React.SetStateAction<number>>;
  children?: ReactNode;
}) {
  const [setShowSelectedPathTiles] = useGameStore((state) => [
    state.setShowSelectedPathTiles,
  ]);

  const setMenuOpenIndexHelper = useCallback(() => {
    if (menuIndex !== menuOpenIndex) {
      setMenuOpenIndex(menuIndex);
    } else {
      // hide selected path upon menu close on default
      setMenuOpenIndex(-1);
      setShowSelectedPathTiles(false);
    }
  }, [menuIndex, menuOpenIndex]);

  return (
    <>
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
    </>
  );
}

function SideMenu() {
  // Only show one element at a time
  // -1 means menu not selected at all.
  const [menuOpenIndex, setMenuOpenIndex] = useState(-1);

  return (
    <div className="z-[1000] viewport-container fixed bottom-4 left-4 selection:font-mono text-white">
      <SideBarIcon
        icon={<IoHammerSharp size="24" />}
        text={"Build"}
        menuIndex={0}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <BuildingPage />
      </SideBarIcon>
      <SideBarIcon
        icon={<IoFlaskSharp size="24" />}
        text="Research"
        menuIndex={1}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <ResearchModal setMenuOpenIndex={setMenuOpenIndex} />
      </SideBarIcon>
      <SideBarIcon
        icon={<TbScale size="24" />}
        text="Trade"
        menuIndex={2}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <MarketModal setMenuOpenIndex={setMenuOpenIndex} />
      </SideBarIcon>
      <SideBarIcon
        icon={<TbSword size="24" />}
        text="Attack"
        menuIndex={3}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <AttackBox />
      </SideBarIcon>
      <SideBarIcon
        icon={<TbBulldozer size="24" />}
        text="Demolish"
        menuIndex={4}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <DestroyBuildingBox />
      </SideBarIcon>
    </div>
  );
}

export default SideMenu;
