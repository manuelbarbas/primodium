import { Button } from "@/components/core/Button";
import { EntityToResourceImage } from "@/util/mappings";
import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { Badge } from "src/components/core/Badge";
import { SecondaryCard } from "src/components/core/Card";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { components } from "src/network/components";
import { upgradeRange } from "src/network/setup/contractCalls/upgradeRange";
import { getEntityTypeName } from "src/util/common";
import { EntityType, TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { getUpgradeInfo } from "src/util/upgrade";

export const ExpandRange: React.FC<{ asteroid: Entity }> = ({ asteroid }) => {
  asteroid;
  const mud = useMud();
  const { playerAccount } = mud;
  const mainBaseEntity = components.Home.use(asteroid)?.value as Entity;
  const mainBaseLevel = components.Level.use(mainBaseEntity, {
    value: 1n,
  }).value;
  const { level, maxLevel, mainBaseLvlReq, recipe, isResearched } = getUpgradeInfo(EntityType.Expansion, asteroid);
  const hasEnough = useHasEnoughResources(recipe, asteroid);
  const canUpgrade = hasEnough && mainBaseLevel >= mainBaseLvlReq && !isResearched;
  const atMaxLevel = level >= maxLevel;

  let error = "";
  if (atMaxLevel) {
    error = "reached max expansion";
  } else if (mainBaseLevel < mainBaseLvlReq) {
    error = `Mainbase lvl. ${mainBaseLvlReq} required`;
  } else if (!hasEnough) {
    error = "Not enough resources";
  }
  return (
    <SecondaryCard className="w-full items-center space-y-2">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-2 items-center">
          <img src={InterfaceIcons.Expansion} className="pixel-images h-8 w-8" />
          <div>
            {recipe.length !== 0 && <p className="text-xs opacity-75 px-2 mb-1">EXPANSION COST</p>}
            <div className="flex flex-col flex-wrap gap-1 px-2">
              {!atMaxLevel &&
                recipe.length !== 0 &&
                recipe.map((resource) => {
                  return (
                    <Badge key={resource.id + resource.type} className="text-xs gap-2">
                      <ResourceIconTooltip
                        name={getEntityTypeName(resource.id)}
                        image={EntityToResourceImage[resource.id]}
                        resource={resource.id}
                        amount={resource.amount}
                        resourceType={resource.type}
                        direction="top"
                        validate
                        spaceRock={asteroid}
                      />
                    </Badge>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      {error && <p className="animate-pulse text-error text-xs uppercase mt-2">{error}</p>}
      <div className="flex gap-1 mt-1">
        {Array(Number(maxLevel))
          .fill(0)
          .map((_, index) => {
            return (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${level - 1n >= index ? "bg-green-600" : "bg-slate-500"}`}
              />
            );
          })}
      </div>
      <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Upgrade, playerAccount.entity)}>
        <Button size="sm" variant="secondary" disabled={!canUpgrade} onClick={() => upgradeRange(mud, asteroid)}>
          Expand
        </Button>
      </TransactionQueueMask>
    </SecondaryCard>
  );
};
