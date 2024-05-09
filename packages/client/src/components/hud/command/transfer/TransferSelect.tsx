import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { Button } from "src/components/core/Button";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { entityToFleetName, entityToRockName } from "@/util/name";
import { getAsteroidImage } from "@/util/asteroid";
import { usePrimodium } from "@/hooks/usePrimodium";
import { useTransfer } from "@/hooks/providers/TransferProvider";

export const TransferSelect = <NewFleet extends boolean | undefined = false>({
  handleSelect,
  showNewFleet,
  hideNotOwned,
}: {
  handleSelect: NewFleet extends true ? (entity: Entity | "newFleet") => void : (entity: Entity) => void;
  showNewFleet?: NewFleet;
  hideNotOwned?: boolean;
}) => {
  const { from, to } = useTransfer();
  const activeEntities = [from, to];
  const rockEntity = components.ActiveRock.use()?.value;
  if (!rockEntity) throw new Error("No active rock");
  const query = [Has(components.IsFleet), HasValue(components.FleetMovement, { destination: rockEntity })];
  const time = components.Time.use()?.value ?? 0n;
  const playerEntity = useMud().playerAccount.entity;
  const fleetsOnRock = [...useEntityQuery(query)].filter((entity) => {
    const arrivalTime = components.FleetMovement.get(entity)?.arrivalTime ?? 0n;
    if (arrivalTime > time) return false;
    if (!hideNotOwned) return true;

    const fleetOwnerRock = components.OwnedBy.get(entity)?.value as Entity | undefined;
    const fleetOwnerPlayer = components.OwnedBy.get(fleetOwnerRock)?.value;
    return fleetOwnerPlayer == playerEntity;
  });

  const handleSelectWithNewFleet = handleSelect as (entity: Entity | "newFleet") => void;

  return (
    <div className="absolute left-0 -translate-x-full w-36 flex flex-col gap-2">
      <p className="text-xs opacity-70 text-right pr-2">Select</p>
      <SelectOption
        entity={rockEntity}
        disabled={activeEntities.includes(rockEntity)}
        onSelect={() => handleSelect(rockEntity)}
      />

      {fleetsOnRock.map((fleet) => (
        <SelectOption
          key={`fleet-option-${fleet}`}
          entity={fleet}
          disabled={activeEntities.includes(fleet)}
          onSelect={() => handleSelect(fleet)}
        />
      ))}
      {showNewFleet == true && (
        <SelectOption
          entity={"newFleet"}
          disabled={activeEntities.includes("newFleet")}
          onSelect={() => handleSelectWithNewFleet("newFleet")}
        />
      )}
    </div>
  );
};

const SelectOption = ({
  entity,
  onSelect,
  disabled,
}: {
  entity: Entity | "newFleet";
  onSelect: () => void;
  selected?: boolean;
  disabled?: boolean;
}) => {
  const primodium = usePrimodium();
  const isFleet = entity !== "newFleet" && components.IsFleet.has(entity);
  const content =
    entity === "newFleet" ? "New Fleet" : isFleet ? entityToFleetName(entity, true) : entityToRockName(entity);

  const imgSrc =
    entity === "newFleet" ? InterfaceIcons.Add : isFleet ? InterfaceIcons.Fleet : getAsteroidImage(primodium, entity);
  return (
    <Button
      disabled={disabled}
      variant="neutral"
      size="sm"
      onClick={onSelect}
      className={`flex flex-row gap-2 items-center text-xs`}
    >
      <img src={imgSrc} className="w-6" />
      {content}
    </Button>
  );
};
