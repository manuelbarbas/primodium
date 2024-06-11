import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { Button } from "src/components/core/Button";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { entityToFleetName, entityToRockName } from "@/util/name";
import { getAsteroidImage } from "@/util/asteroid";
import { useTransfer } from "@/react/hooks/providers/TransferProvider";
import { cn } from "@/util/client";
import { Card } from "@/components/core/Card";
import { useEffect } from "react";
import { getPlayerOwner } from "@/react/hooks/usePlayerOwner";
import { useGame } from "@/react/hooks/useGame";
import { EntityType } from "@/util/constants";
import { useFullResourceCount } from "@/react/hooks/useFullResourceCount";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export const TransferSelect = ({ side }: { side: "left" | "right" }) => {
  const { left, right, setLeft, setRight } = useTransfer();

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
  const showNewFleet = side === "right" && asteroid && playerOwnsRock;
  const canBuildFleet = useFullResourceCount(EntityType.FleetCount, asteroid ?? singletonEntity).resourceCount > 0n;

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

  const handleSelect = (side === "left" ? setLeft : setRight) as (entity: Entity | "newFleet") => void;
  const disabledAsteroidButton =
    activeEntities.includes(asteroid) || (!playerOwnsRock && opposingSide && opposingSideOwner !== playerEntity);

  return (
    <Card className="w-full h-full overflow-hidden" noDecor>
      <div className="flex flex-col justify-between h-full overflow-hidden">
        <div
          className={cn(
            "grid grid-cols-3 gap-2 w-full overflow-y-auto scrollbar auto-rows-max",
            showNewFleet ? "max-h-[calc(100%-5.5rem)]" : "max-h-full"
          )}
        >
          <SelectOption entity={asteroid} disabled={disabledAsteroidButton} onSelect={() => handleSelect(asteroid)} />

          {fleetsOnRock.map((fleet) => (
            <SelectOption
              key={`fleet-option-${fleet}`}
              entity={fleet}
              disabled={activeEntities.includes(fleet)}
              onSelect={() => handleSelect(fleet)}
            />
          ))}
        </div>
        {showNewFleet && (
          <div className="h-[5.5rem] gap-2 border-t border-t-primary mt-1 border-t-2 flex justify-center items-center flex-col">
            {!canBuildFleet && (
              <p className="opacity-70 text-sm text-center">
                Reached Max Fleet Count. Build a Starmapper Station to build more fleets.
              </p>
            )}
            {canBuildFleet && left !== asteroid && (
              <p className="opacity-70 text-sm">Select your asteroid to create a fleet.</p>
            )}
            {canBuildFleet && left === asteroid && (
              <p className="opacity-70 text-sm">Create fleets to expand your empire.</p>
            )}
            {canBuildFleet && (
              <Button
                disabled={!canBuildFleet || left !== asteroid}
                size="sm"
                onClick={() => handleSelect("newFleet")}
                variant="primary"
              >
                Build New Fleet
              </Button>
            )}
          </div>
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
  entity: Entity;
  onSelect: () => void;
  selected?: boolean;
  disabled?: boolean;
}) => {
  const primodium = useGame();
  const player = useMud().playerAccount.entity;
  const isFleet = components.IsFleet.has(entity);
  const content = isFleet ? entityToFleetName(entity) : entityToRockName(entity);
  const playerIsOwner = getPlayerOwner(entity) === player;

  const imgSrc = isFleet
    ? playerIsOwner
      ? InterfaceIcons.Fleet
      : InterfaceIcons.EnemyFleet
    : getAsteroidImage(primodium, entity);
  useEffect(() => () => components.HoverEntity.remove(), []);
  return (
    <Button
      disabled={disabled}
      variant="neutral"
      size="content"
      onClick={onSelect}
      onMouseEnter={() => components.HoverEntity.set({ value: entity })}
      onMouseLeave={() => components.HoverEntity.remove()}
      className={cn(`flex w-full aspect-square flex-col gap-2 items-center`, !playerIsOwner ? "border-error/50" : "")}
    >
      <img src={imgSrc} className="w-8" />
      <span className="text-pretty">{content}</span>
    </Button>
  );
};
