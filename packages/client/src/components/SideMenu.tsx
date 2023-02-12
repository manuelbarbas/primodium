import { useState } from "react";

import { IoHammerSharp } from "react-icons/io5";
import { IoFlaskSharp } from "react-icons/io5";
import { TbBulldozer } from "react-icons/tb";
import { TbSword } from "react-icons/tb";
import { TbScale } from "react-icons/tb";

const [menuItem, setMenuItem] = useState(false);

const SideBarIcon = ({ icon, text }: { icon: any; text: string }) => (
  <div>
    <button
      className="sidebar-icon group"
      onClick={() => setMenuItem(!menuItem)}
    >
      {icon}
      {menuItem && (
        <div className="fixed z-[1000]">building menu goes here</div>
      )}
      <div className="sidebar-tooltip group-hover:scale-100"> {text} </div>
    </button>
  </div>
);

function SideMenu() {
  return (
    <div className="z-[1000] fixed bottom-4 left-4 selection:font-mono text-white">
      <SideBarIcon
        icon={<IoHammerSharp size="24" />}
        text={"Build buildings"}
      />
      <SideBarIcon icon={<IoFlaskSharp size="24" />} text={"Research techs"} />
      <SideBarIcon icon={<TbScale size="24" />} text={"Access market"} />
      <SideBarIcon icon={<TbSword size="24" />} text={"Attack"} />
      <SideBarIcon
        icon={<TbBulldozer size="24" />}
        text={"Destroy buildings"}
      />
    </div>
  );
}

export default SideMenu;
