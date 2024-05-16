import { InterfaceIcons } from "@primodiumxyz/assets";
import { components } from "@/network/components";
import { Mode } from "@/util/constants";
// import { UnitUpgrades } from "@/components/hud/asteroid/building-menu/screens/UnitUpgrades";
import { Tabs } from "@/components/core/Tabs";
import { Join } from "@/components/core/Join";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// import { useGame } from "@/hooks/useGame";
// import { commandCenterScene } from "@/game/lib/config/commandCenterScene";
import { useMud } from "@/hooks";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { useEntityQuery } from "@latticexyz/react";

const btnClass = "group  bg-transparent";

export const CommandViewSelector = () => {
  const commandOpen = components.SelectedMode.use()?.value === Mode.CommandCenter;

  // const { camera } = useGame().COMMAND_CENTER;
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
        <TransferInventoryButton />
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
          <Modal.Content className="w-[62rem]">
            <UnitUpgrades />
          </Modal.Content>
        </Modal> */}
    </div>
  );
};

const TransferInventoryButton = () => {
  const selectedRock = components.SelectedRock.use()?.value;
  const playerEntity = useMud().playerAccount.entity;
  // const { camera } = useGame().COMMAND_CENTER;
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
    <Tabs.IconButton
      index={1}
      className={btnClass}
      disabled={!playerOwnsRock && !playerHasFleetOnRock}
      size={"md"}
      icon={InterfaceIcons.Transfer}
      text="Transfer Inventory"
      // onClick={() => camera.zoomTo(1)}
    />
  );
};
