import { GlassCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { components } from "@/network/components";
import { Mode } from "@/util/constants";
import { Button } from "@/components/core/Button";
import { Modal } from "@/components/core/Modal";
import { UnitUpgrades } from "@/components/hud/building-menu/screens/UnitUpgrades";

const btnClass = "group hover:scale-[115%] bg-gradient-to-r border-l-accent from-secondary/25 to-transparent";
const iconClass = "text-2xl";

export const CommandDock = () => {
  const commandOpen = components.SelectedMode.use()?.value === Mode.CommandCenter;

  if (!commandOpen) return null;

  return (
    <GlassCard direction={"right"} className="h-fit w-12 px-5 animate-in slide-in-from-left-full fade-in">
      <div className="flex flex-col gap-2 items-center pointer-events-auto translate-x-[10px]">
        <Button className={btnClass} shape={"square"} size={"lg"} tooltip="Overview" tooltipDirection="right">
          <IconLabel imageUri={InterfaceIcons.Asteroid} className={iconClass} />
        </Button>
        <Button className={btnClass} shape={"square"} size={"lg"} tooltip="Transfer Inventory" tooltipDirection="right">
          <IconLabel imageUri={InterfaceIcons.Transfer} className={iconClass} />
        </Button>
        <Button className={btnClass} shape={"square"} size={"lg"} tooltip="Current Activities" tooltipDirection="right">
          <IconLabel imageUri={InterfaceIcons.Fleet} className={iconClass} />
        </Button>
        <Modal title="settings">
          <Modal.Button className={btnClass} tooltip="settings" shape={"square"} size={"lg"} tooltipDirection="right">
            <IconLabel className={iconClass} imageUri={InterfaceIcons.Add} />
          </Modal.Button>
          <Modal.Content className="w-[62rem]">
            <UnitUpgrades />
          </Modal.Content>
        </Modal>
      </div>
    </GlassCard>
  );
};
