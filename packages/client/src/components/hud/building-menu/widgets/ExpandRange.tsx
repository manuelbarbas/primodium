import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { EntityType, RESOURCE_SCALE, ResourceImage, ResourceType, TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { getUpgradeInfo } from "src/util/upgrade";
import { upgradeRange } from "src/util/web3/contractCalls/upgradeRange";

export const ExpandRange: React.FC = () => {
  const { network } = useMud();
  const playerEntity = network.playerEntity;
  const mainBaseEntity = components.Home.use(playerEntity)?.mainBase as Entity;
  const mainBaseLevel = components.Level.use(mainBaseEntity, {
    value: 1n,
  }).value;

  const { level, maxLevel, mainBaseLvlReq, recipe, isResearched } = getUpgradeInfo(EntityType.Expansion, playerEntity);

  const hasEnough = useHasEnoughResources(recipe, playerEntity);
  const canUpgrade = hasEnough && mainBaseLevel >= mainBaseLvlReq && !isResearched;

  let error = "";
  if (!hasEnough) {
    error = "Not enough resources";
  } else if (mainBaseLevel < mainBaseLvlReq) {
    error = `Mainbase lvl. ${mainBaseLvlReq} required`;
  } else if (isResearched) {
    error = "reached max expansion";
  }

  return (
    <SecondaryCard className="w-full items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-2 items-center">
          <img src="img/icons/expansionicon.png" className="pixel-images h-8 w-8" />
          <div>
            {recipe.length !== 0 && <p className="text-xs opacity-75 px-2 mb-1">EXPANSION COST</p>}
            <div className="flex flex-wrap gap-1 px-2">
              {recipe.length !== 0 &&
                recipe.map((resource) => {
                  return (
                    <Badge key={resource.id + resource.type} className="text-xs gap-2">
                      <ResourceIconTooltip
                        name={getBlockTypeName(resource.id)}
                        playerEntity={playerEntity}
                        image={ResourceImage.get(resource.id) ?? ""}
                        resource={resource.id}
                        amount={resource.amount}
                        resourceType={resource.type}
                        scale={resource.type === ResourceType.Utility ? 1n : RESOURCE_SCALE}
                        direction="top"
                        validate
                      />
                    </Badge>
                  );
                })}
            </div>
          </div>
        </div>
        <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Upgrade, playerEntity)}>
          <Button
            className="w-fit btn-secondary btn-sm"
            disabled={!canUpgrade}
            // loading={transactionLoading}
            onClick={() => {
              upgradeRange(network);
            }}
          >
            Expand
          </Button>
        </TransactionQueueMask>
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
    </SecondaryCard>
  );
};
