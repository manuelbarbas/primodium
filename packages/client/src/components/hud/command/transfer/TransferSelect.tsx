import { InterfaceIcons } from "@primodiumxyz/assets";
import { Button } from "src/components/core/Button";
import { useTransfer } from "@/hooks/providers/TransferProvider";
import { cn } from "@/util/client";
import { Card } from "@/components/core/Card";
import { useEffect } from "react";
import { useAccountClient, useCore, usePlayerOwner, useResourceCount } from "@primodiumxyz/core/react";
import { entityToFleetName, entityToRockName, EntityType } from "@primodiumxyz/core";
import { defaultEntity, Entity, useQuery } from "@primodiumxyz/reactive-tables";
import { useAsteroidImage } from "@/hooks/useAsteroidImage";

export const TransferSelect = ({ side }: { side: "left" | "right" }) => {
  const { left, right, setLeft, setRight } = useTransfer();
  const { tables, utils } = useCore();

  const opposingSide = side === "left" ? right : left;
  const opposingSideOwner = usePlayerOwner(!opposingSide || opposingSide === "newFleet" ? undefined : opposingSide);
  const playerEntity = useAccountClient().playerAccount.entity;
  const asteroid = tables.SelectedRock.use()?.value;
  const playerOwnsRock = tables.OwnedBy.use(asteroid)?.value === playerEntity;

  // only show new fleet if you own the selected asteroid and there are new fleet slots available
  const showNewFleet = side === "right" && asteroid && playerOwnsRock;
  const canBuildFleet = useResourceCount(EntityType.FleetCount, asteroid ?? defaultEntity).resourceCount > 0n;

  const activeEntities = [left, right];
  const hideNotOwned = activeEntities.some((entity) => {
    if (!entity) return false;
    if (entity === "newFleet") return true;
    if (utils.getPlayerOwner(entity) !== playerEntity) return true;
    return false;
  });

  if (!asteroid) throw new Error("No selected asteroid");

  const allFleetsOnRock = useQuery({
    with: [tables.IsFleet],
    withProperties: [{ table: tables.FleetMovement, properties: { destination: asteroid } }],
  });
  const time = tables.Time.use()?.value ?? 0n;
  const fleetsOnRock = allFleetsOnRock.filter((entity) => {
    const arrivalTime = tables.FleetMovement.get(entity)?.arrivalTime ?? 0n;
    if (arrivalTime > time) return false;
    if (!hideNotOwned) return true;

    const fleetOwnerRock = tables.OwnedBy.get(entity)?.value as Entity | undefined;
    const fleetOwnerPlayer = tables.OwnedBy.get(fleetOwnerRock)?.value;
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
  const player = useAccountClient().playerAccount.entity;
  const { tables } = useCore();
  const isFleet = tables.IsFleet.has(entity);
  const content = isFleet ? entityToFleetName(entity) : entityToRockName(entity);
  const playerIsOwner = usePlayerOwner(entity) === player;

  const asteroidImage = useAsteroidImage(entity);
  const imgSrc = isFleet ? (playerIsOwner ? InterfaceIcons.Fleet : InterfaceIcons.EnemyFleet) : asteroidImage;
  useEffect(() => () => tables.HoverEntity.remove(), []);
  return (
    <Button
      disabled={disabled}
      variant="neutral"
      size="content"
      onClick={onSelect}
      onMouseEnter={() => tables.HoverEntity.set({ value: entity })}
      onMouseLeave={() => tables.HoverEntity.remove()}
      className={cn(`flex w-full aspect-square flex-col gap-2 items-center`, !playerIsOwner ? "border-error/50" : "")}
    >
      <img src={imgSrc} className="w-8" />
      <span className="text-pretty">{content}</span>
    </Button>
  );
};
