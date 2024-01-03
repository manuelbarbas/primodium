import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { useBuildingInfo } from "src/hooks/useBuildingInfo";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { components } from "src/network/components";
import { upgradeBuilding } from "src/network/setup/contractCalls/upgradeBuilding";
import { getBlockTypeName } from "src/util/common";
import { ResourceImage, TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";

export const Upgrade: React.FC<{ building: Entity }> = ({ building }) => {
  const { network } = useMud();
  const playerEntity = network.playerEntity;

  const mainBaseEntity = components.Home.use(playerEntity)?.mainBase as Entity;
  const mainBaseLevel = components.Level.use(mainBaseEntity, {
    value: 1n,
  }).value;

  const buildingInfo = useBuildingInfo(building);
  const hasEnough = useHasEnoughResources(buildingInfo?.upgrade?.recipe ?? []);
  const spaceRock = components.Position.use(building)?.parent as Entity | undefined;

  if (!buildingInfo) return null;
  const { position, level, maxLevel, upgrade } = buildingInfo;
  const canUpgrade = hasEnough && upgrade && level < maxLevel && mainBaseLevel >= upgrade.mainBaseLvlReq;
  const atMaxLevel = level >= maxLevel;

  let error = "";
  if (atMaxLevel) {
    error = "Building max level";
  } else if (upgrade && mainBaseLevel < upgrade.mainBaseLvlReq) {
    error = `Mainbase lvl. ${upgrade.mainBaseLvlReq} required`;
  } else if (!hasEnough) {
    error = "Not enough resources";
  }

  return (
    <SecondaryCard className="w-full items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-2 items-center">
          <img src="img/icons/minersicon.png" className="pixel-images h-8 w-8" />
          <div>
            {upgrade?.recipe.length !== 0 && <p className="text-xs opacity-75 px-2 mb-1">UPGRADE COST</p>}
            <div className="flex flex-wrap gap-1 px-2">
              {!atMaxLevel ? (
                upgrade?.recipe.length !== 0 &&
                upgrade?.recipe.map((resource) => {
                  return (
                    <Badge key={resource.id + resource.type} className="text-xs gap-2">
                      <ResourceIconTooltip
                        name={getBlockTypeName(resource.id)}
                        image={ResourceImage.get(resource.id) ?? ""}
                        resource={resource.id}
                        amount={resource.amount}
                        resourceType={resource.type}
                        spaceRock={spaceRock}
                        direction="top"
                        validate
                      />
                    </Badge>
                  );
                })
              ) : (
                <p className="text-xs opacity-75">-</p>
              )}
            </div>
          </div>
        </div>
        <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Upgrade, position.x, position.y)}>
          <Button
            className="w-fit btn-secondary btn-sm"
            disabled={!canUpgrade}
            onClick={() => upgradeBuilding(position, network)}
          >
            Upgrade
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
