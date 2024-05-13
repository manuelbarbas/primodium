import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { Button } from "src/components/core/Button";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { entityToFleetName, entityToRockName } from "@/util/name";
import { getAsteroidImage } from "@/util/asteroid";
import { useTransfer } from "@/hooks/providers/TransferProvider";
import { cn } from "@/util/client";
import { Card } from "@/components/core/Card";
import { useEffect } from "react";
import { getPlayerOwner } from "@/hooks/usePlayerOwner";
import { useGame } from "@/hooks/useGame";
import { getFullResourceCount } from "@/util/resource";
import { EntityType } from "@/util/constants";

export const TransferSelect = ({ side }: { side: "left" | "right" }) => {
  const { left, right, setLeft, setRight } = useTransfer();
  const handleSelect = side === "left" ? setLeft : setRight;

  const playerEntity = useMud().playerAccount.entity;
  const selectedRock = components.SelectedRock.use()?.value;
  const playerOwnsRock = components.OwnedBy.use(selectedRock)?.value === playerEntity;
  console.log({ selectedRock, playerOwnsRock });
  const showNewFleet =
    side === "right" && playerOwnsRock && getFullResourceCount(EntityType.FleetCount, selectedRock).resourceCount > 0n;

  const fleetDisabled = left !== selectedRock;

  const activeEntities = [left, right];
  const hideNotOwned = activeEntities.some((entity) => {
    if (!entity) return false;
    if (entity === "newFleet") return true;
    if (getPlayerOwner(entity) !== playerEntity) return true;
    return false;
  });

  const rockEntity = components.ActiveRock.use()?.value;
  if (!rockEntity) throw new Error("No active rock");
  const query = [Has(components.IsFleet), HasValue(components.FleetMovement, { destination: rockEntity })];
  const time = components.Time.use()?.value ?? 0n;
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
    <Card className="w-full h-full" noDecor>
      <div className="grid grid-cols-3 gap-2 w-full">
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
        {showNewFleet && (
          <SelectOption
            entity={"newFleet"}
            disabled={fleetDisabled}
            onSelect={() => handleSelectWithNewFleet("newFleet")}
          />
        )}
      </div>
    </Card>
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
  const primodium = useGame();
  const isFleet = entity !== "newFleet" && components.IsFleet.has(entity);
  const content = entity === "newFleet" ? "New Fleet" : isFleet ? entityToFleetName(entity) : entityToRockName(entity);

  const imgSrc =
    entity === "newFleet" ? InterfaceIcons.Add : isFleet ? InterfaceIcons.Fleet : getAsteroidImage(primodium, entity);
  useEffect(() => () => components.HoverEntity.remove(), []);
  return (
    <Button
      disabled={disabled}
      variant="neutral"
      size="content"
      onClick={onSelect}
      onMouseEnter={() => entity !== "newFleet" && components.HoverEntity.set({ value: entity })}
      onMouseLeave={() => components.HoverEntity.remove()}
      className={cn(`flex w-full aspect-square flex-col gap-2 items-center`)}
    >
      <img src={imgSrc} className="w-6" />
      <span className="text-pretty">{content}</span>
    </Button>
  );
};
