import { Entity } from "@latticexyz/recs";
import { memo } from "react";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { BackgroundImage, ResourceImage, TransactionQueueType, UnitEnumLookup } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { getUpgradeInfo } from "src/util/upgrade";
import { upgradeUnit } from "src/util/web3/contractCalls/upgradeUnit";

export const ResearchItem: React.FC<{ type: Entity }> = memo(({ type }) => {
  const { network } = useMud();
  const playerEntity = network.playerEntity;
  const mainBaseEntity = components.Home.use(playerEntity)?.mainBase as Entity;
  const homeAsteroid = components.Home.use(playerEntity)?.asteroid as Entity;
  const mainBaseLevel = components.Level.use(mainBaseEntity, {
    value: 1n,
  }).value;

  const { level, maxLevel, mainBaseLvlReq, recipe, isResearched } = getUpgradeInfo(type, playerEntity);

  const hasEnough = useHasEnoughResources(recipe);
  const canUpgrade = hasEnough && mainBaseLevel >= mainBaseLvlReq && !isResearched;

  let error = "";
  if (!hasEnough) {
    error = "Not enough resources";
  } else if (mainBaseLevel < mainBaseLvlReq) {
    error = `Mainbase lvl. ${mainBaseLvlReq} required`;
  } else if (level >= maxLevel) {
    error = "reached max upgrade";
  }

  return (
    <SecondaryCard className="flex flex-col justify-between items-center h-full">
      <div className="flex flex-col w-full p-2 items-center pb-4">
        <div className="flex gap-1 absolute top-2 left-1/2 -translate-x-1/2">
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

        <IconLabel
          className="text-lg font-bold gap-4 mt-2"
          imageUri={BackgroundImage.get(type)?.at(0) ?? ""}
          text={getBlockTypeName(type)}
        />

        {!isResearched && (
          <div className="mt-2 flex justify-center items-center text-sm gap-2">
            {recipe.map((resource) => {
              const resourceImage = ResourceImage.get(resource.id)!;
              const resourceName = getBlockTypeName(resource.id);
              return (
                <ResourceIconTooltip
                  key={resource.id}
                  image={resourceImage}
                  resource={resource.id}
                  name={resourceName}
                  amount={resource.amount}
                  fontSize="xs"
                />
              );
            })}
          </div>
        )}
      </div>
      <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Upgrade, type)}>
        <Button
          className="btn-sm btn-secondary"
          disabled={!canUpgrade}
          onClick={() => {
            upgradeUnit(homeAsteroid, UnitEnumLookup[type], network);
          }}
        >
          Upgrade
        </Button>
      </TransactionQueueMask>

      {error && <p className="text-xs text-error animate-pulse uppercase py-1">{error}</p>}
    </SecondaryCard>
  );
});
