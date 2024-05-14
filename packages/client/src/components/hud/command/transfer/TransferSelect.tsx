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

const filter = "invert(17%) sepia(70%) saturate(605%) hue-rotate(260deg) brightness(101%) contrast(111%)";

export const TransferSelect = ({ side }: { side: "left" | "right" }) => {
  const { left, right, setLeft, setRight } = useTransfer();
  const handleSelect = side === "left" ? setLeft : setRight;

  const opposingSide = side === "left" ? right : left;
  const opposingSideOwner = opposingSide
    ? opposingSide === "newFleet"
      ? undefined
      : getPlayerOwner(opposingSide)
    : undefined;
  const playerEntity = useMud().playerAccount.entity;
  const asteroid = components.SelectedRock.use()?.value;
  const playerOwnsRock = components.OwnedBy.use(asteroid)?.value === playerEntity;

  // only show new fleet if you own the selected asteroid and there are new fleet slots available
  const showNewFleet =
    side === "right" &&
    asteroid &&
    playerOwnsRock &&
    getFullResourceCount(EntityType.FleetCount, asteroid).resourceCount > 0n;

  // new fleet is disabled if the left side is not the asteroid
  const fleetDisabled = left !== asteroid;

  const activeEntities = [left, right];
  const hideNotOwned = activeEntities.some((entity) => {
    if (!entity) return false;
    if (entity === "newFleet") return true;
    if (getPlayerOwner(entity) !== playerEntity) return true;
    return false;
  });

  if (!asteroid) throw new Error("No selected asteroid");
  const query = [Has(components.IsFleet), HasValue(components.FleetMovement, { destination: asteroid })];
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
  const disabledAsteroidButton =
    activeEntities.includes(asteroid) || (!playerOwnsRock && opposingSide && opposingSideOwner !== playerEntity);

  return (
    <Card className="w-full h-full" noDecor>
      <div className="grid grid-cols-3 gap-2 w-full">
        <SelectOption entity={asteroid} disabled={disabledAsteroidButton} onSelect={() => handleSelect(asteroid)} />

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
  const player = useMud().playerAccount.entity;
  const isFleet = entity !== "newFleet" && components.IsFleet.has(entity);
  const content = entity === "newFleet" ? "New Fleet" : isFleet ? entityToFleetName(entity) : entityToRockName(entity);
  const playerIsOwner = entity === "newFleet" ? true : getPlayerOwner(entity) === player;

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
      className={cn(`flex w-full aspect-square flex-col gap-2 items-center`, !playerIsOwner ? "border-error/50" : "")}
    >
      <img src={imgSrc} className={cn("w-8")} style={!isFleet || playerIsOwner ? {} : { filter }} />
      <span className="text-pretty">{content}</span>
    </Button>
  );
};
