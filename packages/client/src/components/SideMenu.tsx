import { useState, ReactNode } from "react";

import { IoHammerSharp } from "react-icons/io5";
import { IoFlaskSharp } from "react-icons/io5";
import { TbBulldozer } from "react-icons/tb";
import { TbSword } from "react-icons/tb";
import { TbScale } from "react-icons/tb";

function SideBarIcon({
  icon,
  text,
  children,
}: {
  icon: any;
  text: string;
  children?: ReactNode;
}) {
  const [menuItem, setMenuItem] = useState(false);

  return (
    <div>
      <button
        className="sidebar-icon group"
        onClick={() => setMenuItem(!menuItem)}
      >
        {icon}
        {menuItem && children}
        <div className="sidebar-tooltip group-hover:scale-100"> {text} </div>
      </button>
    </div>
  );
}

function SideMenu() {
  return (
    <div className="z-[1000] fixed bottom-4 left-4 selection:font-mono text-white">
      <SideBarIcon icon={<IoHammerSharp size="24" />} text={"Build buildings"}>
        <div className="fixed z-[1000]">building menu goes here</div>
      </SideBarIcon>
      <SideBarIcon icon={<IoFlaskSharp size="24" />} text={"Research techs"}>
        <div className="fixed z-[1000]">building menu goes here</div>
      </SideBarIcon>
      <SideBarIcon icon={<TbScale size="24" />} text={"Access market"}>
        <div className="fixed z-[1000]">building menu goes here</div>
      </SideBarIcon>
      <SideBarIcon icon={<TbSword size="24" />} text={"Attack"}>
        <div className="fixed z-[1000]">building menu goes here</div>
      </SideBarIcon>
      <SideBarIcon icon={<TbBulldozer size="24" />} text={"Destroy buildings"}>
        <div className="fixed z-[1000]">building menu goes here</div>
      </SideBarIcon>
    </div>
  );
}

export default SideMenu;
