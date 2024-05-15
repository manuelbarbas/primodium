import { InterfaceIcons } from "@primodiumxyz/assets";
import { components } from "@/network/components";
import { Mode } from "@/util/constants";
// import { UnitUpgrades } from "@/components/hud/asteroid/building-menu/screens/UnitUpgrades";
import { Tabs } from "@/components/core/Tabs";
import { Join } from "@/components/core/Join";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const btnClass = "group  bg-transparent";

export const CommandViewSelector = () => {
  const commandOpen = components.SelectedMode.use()?.value === Mode.CommandCenter;

  if (!commandOpen) return null;

  return (
    <div className="flex mt-36 items-center pointer-events-auto -translate-x-[10px]">
      <Tabs.PrevButton variant="ghost">
        <FaChevronLeft className="text-accent" />
      </Tabs.PrevButton>
      <Join className="hover:bg-neutral">
        <Tabs.IconButton
          index={0}
          className={btnClass}
          icon={InterfaceIcons.Asteroid}
          text="Overview"
          size={"md"}
          motion="disabled"
          tooltipDirection="left"
        />
        <Tabs.IconButton
          index={1}
          className={btnClass}
          icon={InterfaceIcons.Transfer}
          text="Transfer Inventory"
          size={"md"}
          motion="disabled"
          tooltipDirection="left"
        />
        <Tabs.IconButton
          index={2}
          className={btnClass}
          icon={InterfaceIcons.Add}
          text="Upgrade Units"
          size={"md"}
          motion="disabled"
          tooltipDirection="left"
        />
      </Join>
      <Tabs.NextButton variant="ghost" maxIndex={2}>
        <FaChevronRight className="text-accent" />
      </Tabs.NextButton>
      {/* Overview */}

      {/* Transfer */}
      {/* <Tabs.Button index={2} shape={"square"} size={"lg"} tooltip="Transfer Inventory" tooltipDirection="left">
          <IconLabel imageUri={InterfaceIcons.Transfer} className={iconClass} />
        </Tabs.Button> */}

      {/* <Modal title="Upgrade">
          <Modal.Button className={btnClass} tooltip="upgrade" shape={"square"} size={"lg"} tooltipDirection="left">
            <IconLabel className={iconClass} imageUri={InterfaceIcons.Add} />
          </Modal.Button>
          <Modal.Content className="w-[62rem]">
            <UnitUpgrades />
          </Modal.Content>
        </Modal> */}
    </div>
  );
};
