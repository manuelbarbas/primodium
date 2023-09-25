import { SingletonID } from "@latticexyz/network";
import { EntityID } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { Level, MainBase } from "src/network/components/chainComponents";
import { Account } from "src/network/components/clientComponents";
import { useGameStore } from "src/store/GameStore";
import { getBlockTypeName } from "src/util/common";
import {
  ResourceImage,
  ResourceType,
  RESOURCE_SCALE,
} from "src/util/constants";
import { ExpansionResearchTree, getResearchInfo } from "src/util/research";
import { upgradeRange } from "src/util/web3";

export const ExpandRange: React.FC = () => {
  const network = useMud();
  const transactionLoading = useGameStore((state) => state.transactionLoading);
  const { levels } = ExpansionResearchTree;
  const player = Account.use()?.value ?? SingletonID;
  const mainBaseEntity = MainBase.use(player, {
    value: "-1" as EntityID,
  }).value;
  const mainBaseLevel = Level.use(mainBaseEntity, {
    value: 0,
  }).value;

  const { level, maxLevel, mainBaseLvlReq, recipe } = getResearchInfo(
    ExpansionResearchTree,
    player
  );

  const hasEnough = useHasEnoughResources(recipe);
  const canUpgrade =
    hasEnough && mainBaseLevel >= mainBaseLvlReq && level < maxLevel;

  let error = "";
  if (!hasEnough) {
    error = "Not enough resources";
  } else if (mainBaseLevel < mainBaseLvlReq) {
    error = `Mainbase lvl. ${mainBaseLvlReq} required`;
  } else if (level >= maxLevel) {
    error = "reached max expansion";
  }

  return (
    <SecondaryCard className="w-full items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-2 items-center">
          <img
            src="img/icons/expansionicon.png"
            className="pixel-images h-8 w-8"
          />
          <div>
            {recipe.length !== 0 && (
              <p className="text-xs opacity-75 px-2 mb-1">EXPANSION COST</p>
            )}
            <div className="flex flex-wrap gap-1 px-2">
              {recipe.length !== 0 &&
                recipe.map((resource) => {
                  return (
                    <Badge
                      key={resource.id + resource.type}
                      className="text-xs gap-2"
                    >
                      <ResourceIconTooltip
                        name={getBlockTypeName(resource.id)}
                        image={ResourceImage.get(resource.id) ?? ""}
                        resourceId={resource.id}
                        amount={resource.amount}
                        resourceType={resource.type}
                        scale={
                          resource.type === ResourceType.Utility
                            ? 1
                            : RESOURCE_SCALE
                        }
                        direction="top"
                        validate
                      />
                    </Badge>
                  );
                })}
            </div>
          </div>
        </div>

        <Button
          className="w-fit btn-secondary btn-sm"
          disabled={!canUpgrade}
          loading={transactionLoading}
          onClick={() => {
            upgradeRange(network);
          }}
        >
          Expand
        </Button>
      </div>
      {error && (
        <p className="animate-pulse text-error text-xs uppercase mt-2">
          {error}
        </p>
      )}
      <div className="flex gap-1 mt-1">
        {levels.map((_, index) => {
          return (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                level - 1 >= index ? "bg-green-600" : "bg-slate-500"
              }`}
            />
          );
        })}
      </div>
    </SecondaryCard>
  );
};
