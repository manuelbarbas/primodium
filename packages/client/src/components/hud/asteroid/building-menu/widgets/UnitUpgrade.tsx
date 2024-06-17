import { Entity } from "@primodiumxyz/reactive-tables";
import { memo } from "react";
import { Badge } from "@/components/core/Badge";
import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { ResourceIconTooltip } from "@/components/shared/ResourceIconTooltip";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { ResourceType, getEntityTypeName } from "@primodiumxyz/core";
import { EntityToResourceImage } from "@/util/image";
import { useCore, useHasEnoughResources } from "@primodiumxyz/core/react";
import { formatNumber, formatResourceCount, EntityType, UnitEnumLookup } from "@primodiumxyz/core";
import { EntityToUnitImage } from "@/util/image";
import { useContractCalls } from "@/hooks/useContractCalls";

export const RecipeDisplay: React.FC<{
  asteroid: Entity;
  recipe: {
    id: Entity;
    type: ResourceType;
    amount: bigint;
  }[];
  count?: bigint;
}> = memo(({ recipe, asteroid, count = 1n }) => {
  return (
    <SecondaryCard className="items-center gap-1 w-full !border-error/50 bg-transparent p-1">
      <p className="font-bold absolute opacity-75 left-0 top-1/2 -translate-y-1/2 text-error text-sm ml-1">-</p>
      <div className="flex flex-wrap justify-center items-center gap-1">
        {recipe.length == 0 ? (
          <Badge className="font-bold">FREE</Badge>
        ) : (
          recipe.map((resource, i) => {
            return (
              <Badge key={`recipe-chunk-${i}`} className="border border-secondary/75">
                <ResourceIconTooltip
                  key={resource.id + resource.type}
                  spaceRock={asteroid}
                  image={EntityToResourceImage[resource.id]}
                  resource={resource.id}
                  resourceType={resource.type}
                  name={getEntityTypeName(resource.id)}
                  amount={resource.amount * count}
                  validate
                  fontSize={"xs"}
                  short
                  direction="top"
                  fractionDigits={1}
                />
              </Badge>
            );
          })
        )}
      </div>
    </SecondaryCard>
  );
});
export const UnitUpgrade: React.FC<{ unit: Entity }> = memo(({ unit }) => {
  const { tables, utils } = useCore();
  const { upgradeUnit } = useContractCalls();

  const asteroid = tables.ActiveRock.use()?.value as Entity | undefined;
  if (!asteroid) throw new Error("No active rock entity found");
  const mainBaseEntity = tables.Home.use(asteroid)?.value as Entity;
  const mainBaseLevel = tables.Level.use(mainBaseEntity, {
    value: 1n,
  }).value;

  const { level, maxLevel, mainBaseLvlReq, recipe, isResearched } = utils.getUpgradeInfo(unit, asteroid);

  const hasEnough = useHasEnoughResources(recipe, asteroid);
  const canUpgrade = hasEnough && mainBaseLevel >= mainBaseLvlReq && !isResearched;

  let error = "";
  if (!hasEnough) {
    error = "Not enough resources";
  } else if (mainBaseLevel < mainBaseLvlReq) {
    error = `Mainbase lvl. ${mainBaseLvlReq} required`;
  } else if (level >= maxLevel) {
    error = "reached max upgrade";
  }

  const nextStats = utils.getUnitLevelStats(unit, level + 1n);
  return (
    <SecondaryCard className="flex flex-col gap-4 p-6 justify-between items-center">
      <div className="flex gap-1 absolute top-2 left-1/2 -translate-x-1/2">
        {Array(Number(maxLevel + 1n))
          .fill(0)
          .map((_, index) => {
            return (
              <div key={index} className={`w-2 h-2 rounded-full ${level >= index ? "bg-green-600" : "bg-slate-500"}`} />
            );
          })}
      </div>

      <IconLabel
        className="text-lg font-bold gap-4 mt-2"
        imageUri={EntityToUnitImage[unit] ?? ""}
        text={getEntityTypeName(unit)}
      />
      <div className="grid grid-cols-6 gap-2 border-y border-cyan-400/30 mx-auto">
        {Object.entries(utils.getUnitLevelStats(unit, level)).map(([name, value]) => {
          const increase = level === maxLevel ? 0n : nextStats[name as keyof typeof nextStats] - value;
          return (
            <div key={name} className="flex flex-col items-center">
              <p className="text-xs opacity-50">{name}</p>

              <p className="text-sm">
                {name === "SPD" ? formatNumber(value) : formatResourceCount(EntityType.Iron, value)}
              </p>
              <p className="text-xs text-success">
                {increase > 0n ? "+" : ""}
                {name === "SPD" ? formatNumber(increase) : formatResourceCount(EntityType.Iron, increase)}
              </p>
            </div>
          );
        })}
      </div>

      <RecipeDisplay asteroid={asteroid} recipe={recipe} />
      <TransactionQueueMask queueItemId={`upgrade-${unit}`}>
        <Button
          className="btn-sm btn-secondary"
          disabled={!canUpgrade}
          onClick={() => upgradeUnit(asteroid, UnitEnumLookup[unit])}
        >
          Upgrade
        </Button>
      </TransactionQueueMask>

      {error && <p className="text-xs text-error animate-pulse uppercase py-1">{error}</p>}
    </SecondaryCard>
  );
});
