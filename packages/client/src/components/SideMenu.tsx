import { useState, useCallback, ReactNode, useEffect } from "react";

import { IoHammerSharp } from "react-icons/io5";
import { IoFlaskSharp } from "react-icons/io5";
import { TbBulldozer } from "react-icons/tb";
import { TbSword } from "react-icons/tb";
import { TbScale } from "react-icons/tb";
import BuildingBox from "./BuildingBox";

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
  const setMenuOpenIndexHelper = useCallback(() => {
    if (menuIndex !== menuOpenIndex) {
      setMenuOpenIndex(menuIndex);
    } else {
      setMenuOpenIndex(-1);
    }
  }, [menuIndex, menuOpenIndex]);

  return (
    <button className="sidebar-icon group" onClick={setMenuOpenIndexHelper}>
      {icon}
      {menuIndex === menuOpenIndex && children}
      {menuIndex !== menuOpenIndex && (
        <div className="sidebar-tooltip group-hover:scale-100"> {text} </div>
      )}
    </button>
  );
}

function SideMenu() {
  // Only show one element at a time
  // -1 means menu not selected at all.
  const [menuOpenIndex, setMenuOpenIndex] = useState(-1);

  useEffect(() => {
    console.log("Open Index changed", menuOpenIndex);
  }, [menuOpenIndex]);

  return (
    <div className="z-[1000] fixed bottom-4 left-4 selection:font-mono text-white">
      <SideBarIcon
        icon={<IoHammerSharp size="24" />}
        text={"Build buildings"}
        menuIndex={0}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <BuildingBox></BuildingBox>
      </SideBarIcon>
      <SideBarIcon
        icon={<IoFlaskSharp size="24" />}
        text="Research techs"
        menuIndex={1}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <div className="fixed z-[1000]">building menu goes here</div>
      </SideBarIcon>
      <SideBarIcon
        icon={<TbScale size="24" />}
        text="Access market"
        menuIndex={2}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <div className="fixed z-[1000]">building menu goes here</div>
      </SideBarIcon>
      <SideBarIcon
        icon={<TbSword size="24" />}
        text="Attack"
        menuIndex={3}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <div className="fixed z-[1000]">building menu goes here</div>
      </SideBarIcon>
      <SideBarIcon
        icon={<TbBulldozer size="24" />}
        text="Destroy buildings"
        menuIndex={4}
        menuOpenIndex={menuOpenIndex}
        setMenuOpenIndex={setMenuOpenIndex}
      >
        <div className="fixed z-[1000]">building menu goes here</div>
      </SideBarIcon>
    </div>
  );
}

export default SideMenu;
