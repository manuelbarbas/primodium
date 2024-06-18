import { Button } from "@/components/core/Button";
import { Entity } from "@primodiumxyz/reactive-tables";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { Badge } from "@/components/core/Badge";
import { SecondaryCard } from "@/components/core/Card";
import { ResourceIconTooltip } from "@/components/shared/ResourceIconTooltip";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useCore, useHasEnoughResources, useBuildingInfo } from "@primodiumxyz/core/react";
import { getEntityTypeName } from "@primodiumxyz/core";
import { EntityToResourceImage } from "@/util/image";
import { useContractCalls } from "@/hooks/useContractCalls";

export const Upgrade: React.FC<{ building: Entity }> = ({ building }) => {
  const { tables } = useCore();

  const spaceRock = (tables.Position.use(building)?.parentEntity ?? tables.Position.get(building)?.parentEntity) as
    | Entity
    | undefined;

  if (!spaceRock) throw new Error("[Upgrade] Building has no parentEntity");
  const mainBaseEntity = tables.Home.use(spaceRock)?.value as Entity;
  const mainBaseLevel = tables.Level.use(mainBaseEntity, {
    value: 1n,
  }).value;

  const buildingInfo = useBuildingInfo(building);
  const hasEnough = useHasEnoughResources(buildingInfo?.upgrade?.recipe ?? [], spaceRock);
  const { upgradeBuilding } = useContractCalls();

  if (!buildingInfo || !spaceRock) return null;
  const { level, maxLevel, upgrade } = buildingInfo;
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
    <SecondaryCard className="w-full items-center space-y-2">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-2 items-center">
          <img src={InterfaceIcons.Build} className="pixel-images h-8 w-8" />
          <div>
            {upgrade?.recipe.length !== 0 && <p className="text-xs opacity-75 px-2 mb-1">UPGRADE COST</p>}
            <div className="flex flex-col flex-wrap gap-1 px-2">
              {!atMaxLevel ? (
                upgrade?.recipe.length !== 0 &&
                upgrade?.recipe.map((resource) => {
                  return (
                    <Badge key={resource.id + resource.type} className="text-xs gap-2">
                      <ResourceIconTooltip
                        name={getEntityTypeName(resource.id)}
                        image={EntityToResourceImage[resource.id]}
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
      <TransactionQueueMask queueItemId={`upgrade-${building}`}>
        <Button size="sm" variant="secondary" disabled={!canUpgrade} onClick={() => upgradeBuilding(building)}>
          Upgrade
        </Button>
      </TransactionQueueMask>
    </SecondaryCard>
  );
};
