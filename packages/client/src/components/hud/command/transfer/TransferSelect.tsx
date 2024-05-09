import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { Button } from "src/components/core/Button";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { entityToFleetName, entityToRockName } from "@/util/name";
import { getAsteroidImage } from "@/util/asteroid";
import { usePrimodium } from "@/hooks/usePrimodium";

export const TransferSelect = ({
  activeEntities,
  setEntity,
  showNewFleet,
  hideNotOwned,
}: {
  activeEntities: (Entity | "newFleet" | undefined)[];
  setEntity: (entity: Entity | "newFleet") => void;
  showNewFleet?: boolean;
  hideNotOwned?: boolean;
}) => {
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

  return (
    <div className="absolute left-0 -translate-x-full w-36 flex flex-col gap-2">
      <SelectOption
        entity={rockEntity}
        disabled={activeEntities.includes(rockEntity)}
        onSelect={() => setEntity(rockEntity)}
      />

      {fleetsOnRock.map((fleet) => (
        <SelectOption
          key={`fleet-option-${fleet}`}
          entity={fleet}
          disabled={activeEntities.includes(fleet)}
          onSelect={() => setEntity(fleet)}
        />
      ))}
      {showNewFleet && (
        <SelectOption
          entity={"newFleet"}
          disabled={activeEntities.includes("newFleet")}
          onSelect={() => setEntity("newFleet")}
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
