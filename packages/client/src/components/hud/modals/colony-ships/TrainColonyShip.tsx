import { Badge } from "@/components/core/Badge";
import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { ResourceIconTooltip } from "@/components/shared/ResourceIconTooltip";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useMud } from "@/hooks";
import { components } from "@/network/components";
import { train } from "@/network/setup/contractCalls/train";
import { getEntityTypeName } from "@/util/common";
import { EntityType, ResourceEnumLookup, UnitEnumLookup } from "@/util/constants";
import { EntityToResourceImage, EntityToUnitImage } from "@/util/mappings";
import { formatNumber, formatResourceCount } from "@/util/number";
import { getRecipe } from "@/util/recipe";
import { getUnitStats } from "@/util/unit";
import { Entity } from "@latticexyz/recs";
import React, { useCallback, useMemo } from "react";
import { Hex } from "viem";

export const TrainColonyShip: React.FC<{ onCommission?: () => void; buildingEntity: Entity; className?: string }> = ({
  onCommission,
  buildingEntity,
  className = "",
}) => {
  const asteroid = components.OwnedBy.use(buildingEntity)?.value as Entity;
  if (!asteroid) throw new Error("[ColonyShipData] No asteroid selected");

  const mud = useMud();
  const unit = EntityType.ColonyShip;
  const unitLevel = useMemo(() => {
    return components.UnitLevel.getWithKeys({ entity: asteroid as Hex, unit: unit as Hex })?.value ?? 0n;
  }, [unit, asteroid]);

  const recipe = useMemo(() => {
    return getRecipe(unit, unitLevel);
  }, [unit, unitLevel]);

  const shipImage = EntityToUnitImage[unit] ?? "";

  const canCommission = recipe.every((resource) => {
    const resourceCount =
      components.ResourceCount.getWithKeys({
        entity: asteroid as Hex,
        resource: ResourceEnumLookup[resource.id],
      })?.value ?? 0n;
    return resourceCount >= resource.amount;
  });

  const handleCommission = useCallback(() => {
    train(mud, buildingEntity, UnitEnumLookup[unit], 1n);
    onCommission && onCommission();
  }, [buildingEntity, mud, onCommission, unit]);

  return (
    <SecondaryCard className={`h-full w-full flex flex-col gap-6 p-3 justify-center items-center ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <img src={shipImage} className="h-10" />
        <p>Colony Ship</p>
      </div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-1 border-y border-cyan-400/30 mx-auto">
        {Object.entries(getUnitStats(EntityType.ColonyShip, asteroid)).map(([name, value]) => {
          return (
            <div key={name} className="flex flex-col items-center">
              <p className="text-xs opacity-50">{name}</p>
              <p>{["SPD"].includes(name) ? formatNumber(value) : formatResourceCount(EntityType.Iron, value)}</p>
            </div>
          );
        })}
      </div>
      {recipe && (
        <div className="flex justify-center items-center gap-1">
          {recipe.map((resource, i) => (
            <Badge key={`resource-${i}`}>
              <ResourceIconTooltip
                image={EntityToResourceImage[resource.id] ?? ""}
                resource={resource.id}
                name={getEntityTypeName(resource.id)}
                amount={resource.amount}
                fontSize="sm"
                validate
                spaceRock={asteroid}
              />
            </Badge>
          ))}
        </div>
      )}
      <TransactionQueueMask queueItemId={"TRAIN" as Entity}>
        <Button onClick={handleCommission} variant="primary" size="sm" disabled={!canCommission}>
          Commission
        </Button>
      </TransactionQueueMask>
    </SecondaryCard>
  );
};
