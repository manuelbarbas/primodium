import { GlassCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { components } from "@/network/components";
import { Mode } from "@/util/constants";
import { Modal } from "@/components/core/Modal";
import { UnitUpgrades } from "@/components/hud/asteroid/building-menu/screens/UnitUpgrades";
import { Tabs } from "@/components/core/Tabs";
import { useGame } from "@/hooks/useGame";
import { commandCenterScene } from "@/game/lib/config/commandCenterScene";
import { useMud } from "@/hooks";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { useEntityQuery } from "@latticexyz/react";

const btnClass = "group hover:scale-[115%] bg-gradient-to-r border-l-accent from-secondary/25 to-transparent";
const iconClass = "text-2xl";

export const CommandViewSelector = () => {
  const commandOpen = components.SelectedMode.use()?.value === Mode.CommandCenter;

  const { camera } = useGame().COMMAND_CENTER;
  if (!commandOpen) return null;

  return (
    <GlassCard direction={"right"} className="h-fit w-12 px-5 animate-in slide-in-from-left-full fade-in">
      <div className="flex flex-col gap-2 items-center pointer-events-auto translate-x-[10px]">
        {/* Overview */}
        <Tabs.Button
          index={0}
          togglable
          className={btnClass}
          shape={"square"}
          size={"lg"}
          tooltip="Overview"
          tooltipDirection="right"
          onClick={() => camera.zoomTo(commandCenterScene.camera.defaultZoom)}
        >
          <IconLabel imageUri={InterfaceIcons.Asteroid} className={iconClass} />
        </Tabs.Button>
        <Tabs.Button
          index={1}
          className={btnClass}
          shape={"square"}
          size={"lg"}
          tooltip="Current Activities"
          tooltipDirection="right"
          onClick={() => camera.zoomTo(commandCenterScene.camera.defaultZoom)}
        >
          <IconLabel imageUri={InterfaceIcons.Fleet} className={iconClass} />
        </Tabs.Button>

        <TransferInventoryButton />
        <Modal title="Upgrade">
          <Modal.Button
            className={btnClass}
            tooltip="upgrade"
            shape={"square"}
            size={"lg"}
            tooltipDirection="right"
            onClick={() => camera.zoomTo(commandCenterScene.camera.defaultZoom)}
          >
            <IconLabel className={iconClass} imageUri={InterfaceIcons.Add} />
          </Modal.Button>
          <Modal.Content className="w-[45rem]">
            <UnitUpgrades />
          </Modal.Content>
        </Modal>
      </div>
    </GlassCard>
  );
};

const TransferInventoryButton = () => {
  const selectedRock = components.SelectedRock.use()?.value;
  const playerEntity = useMud().playerAccount.entity;
  const { camera } = useGame().COMMAND_CENTER;
  const playerOwnsRock = components.OwnedBy.get(selectedRock)?.value === playerEntity;
  const time = components.Time.use()?.value ?? 0n;

  const query = [Has(components.IsFleet), HasValue(components.FleetMovement, { destination: selectedRock })];
  const playerHasFleetOnRock = [...useEntityQuery(query)].some((entity) => {
    const arrivalTime = components.FleetMovement.get(entity)?.arrivalTime ?? 0n;
    if (arrivalTime > time) return false;

    const fleetOwnerRock = components.OwnedBy.get(entity)?.value as Entity | undefined;
    const fleetOwnerPlayer = components.OwnedBy.get(fleetOwnerRock)?.value;
    return fleetOwnerPlayer == playerEntity;
  });

  return (
    <Tabs.Button
      index={2}
      className={btnClass}
      disabled={!playerOwnsRock && !playerHasFleetOnRock}
      shape={"square"}
      size={"lg"}
      tooltip="Transfer Inventory"
      tooltipDirection="right"
      onClick={() => camera.zoomTo(1)}
    >
      <IconLabel imageUri={InterfaceIcons.Transfer} className={iconClass} />
    </Tabs.Button>
  );
};
