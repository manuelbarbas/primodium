import { InterfaceIcons } from "@primodiumxyz/assets";
import { components } from "@/network/components";
import { Mode } from "@/util/constants";
import { Tabs } from "@/components/core/Tabs";
import { Join } from "@/components/core/Join";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useMud } from "@/hooks";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { useEntityQuery } from "@latticexyz/react";

const btnClass = "group  bg-transparent";

export const CommandViewSelector = () => {
  const playerEntity = components.Account.use()?.value;
  const selectedRock = components.SelectedRock.use()?.value;
  const owner = components.OwnedBy.use(selectedRock)?.value;
  const ownedByPlayer = owner === playerEntity;
  const commandOpen = components.SelectedMode.use()?.value === Mode.CommandCenter;

  if (!commandOpen) return null;

  return (
    <div className="flex items-center pointer-events-auto -translate-x-[10px]">
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
          disabled={!ownedByPlayer}
          tooltipDirection="left"
        />
      </Join>
      <Tabs.NextButton variant="ghost" maxIndex={2}>
        <FaChevronRight className="text-accent" />
      </Tabs.NextButton>
    </div>
  );
};

const TransferInventoryButton = () => {
  const selectedRock = components.SelectedRock.use()?.value;
  const playerEntity = useMud().playerAccount.entity;
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
    />
  );
};
