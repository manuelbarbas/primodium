import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { InterfaceIcons } from "@primodiumxyz/assets";
import { Mode } from "@primodiumxyz/core";
import { useAccountClient, useCore } from "@primodiumxyz/core/react";
import { Entity, useQuery } from "@primodiumxyz/reactive-tables";
import { Join } from "@/components/core/Join";
import { Tabs } from "@/components/core/Tabs";

const btnClass = "group  bg-transparent";

export const CommandViewSelector = ({ setInitialRight }: { setInitialRight?: () => void }) => {
  const { tables } = useCore();
  const playerEntity = tables.Account.use()?.value;
  const selectedRock = tables.SelectedRock.use()?.value;
  const owner = tables.OwnedBy.use(selectedRock)?.value;
  const ownedByPlayer = owner === playerEntity;
  const commandOpen = tables.SelectedMode.use()?.value === Mode.CommandCenter;

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
        <TransferInventoryButton setInitialRight={setInitialRight} />
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

const TransferInventoryButton = ({ setInitialRight }: { setInitialRight?: () => void }) => {
  const { tables } = useCore();
  const selectedRock = tables.SelectedRock.use()?.value;
  const playerEntity = useAccountClient().playerAccount.entity;
  const playerOwnsRock = tables.OwnedBy.get(selectedRock)?.value === playerEntity;
  const time = tables.Time.use()?.value ?? 0n;

  const fleetsOnRock = useQuery({
    with: [tables.IsFleet],
    withProperties: [{ table: tables.FleetMovement, properties: { destination: selectedRock } }],
  });
  const playerHasFleetOnRock = fleetsOnRock.some((entity) => {
    const arrivalTime = tables.FleetMovement.get(entity)?.arrivalTime ?? 0n;
    if (arrivalTime > time) return false;

    const fleetOwnerRock = tables.OwnedBy.get(entity)?.value as Entity;
    const fleetOwnerPlayer = tables.OwnedBy.get(fleetOwnerRock)?.value;
    return fleetOwnerPlayer == playerEntity;
  });

  return (
    <Tabs.IconButton
      index={1}
      className={btnClass}
      onClick={setInitialRight}
      disabled={!playerOwnsRock && !playerHasFleetOnRock}
      size={"md"}
      icon={InterfaceIcons.Transfer}
      text="Transfer Inventory"
    />
  );
};
