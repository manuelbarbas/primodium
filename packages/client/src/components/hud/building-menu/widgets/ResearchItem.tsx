import { EntityID } from "@latticexyz/recs";
import { memo, useCallback, useState } from "react";

import { SingletonID } from "@latticexyz/network";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { Level, MainBase } from "src/network/components/chainComponents";
import { Account } from "src/network/components/clientComponents";
import { getBlockTypeName } from "src/util/common";
import { ResearchImage, ResourceImage } from "src/util/constants";
import { ResearchItemType, getResearchInfo } from "src/util/research";
import { research } from "src/util/web3";

export const ResearchItem: React.FC<{ data: ResearchItemType }> = memo(({ data }) => {
  // fetch whether research is completed
  const network = useMud();
  const player = Account.use()?.value ?? SingletonID;
  const { name, levels } = data;
  const { level, mainBaseLvlReq, maxLevel, recipe } = getResearchInfo(data, player);

  const mainBaseEntity = MainBase.use(player, {
    value: "-1" as EntityID,
  }).value;
  const mainBaseLevel = Level.use(mainBaseEntity, {
    value: 0,
  }).value;

  const isResearched = level >= maxLevel;

  const researchId = levels[isResearched ? level - 1 : level].id;

  // New state so not every other research item button shows loading when only current research button is clicked.
  const [userClickedLoading, setUserClickedLoading] = useState(false);

  const executeResearch = useCallback(async () => {
    setUserClickedLoading(true);
    await research(researchId, network);

    setUserClickedLoading(false);
  }, [researchId, network]);

  const hasEnough = useHasEnoughResources(recipe);

  const canUpgrade = hasEnough && mainBaseLevel >= mainBaseLvlReq && level < maxLevel;

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
          {levels.map((_, index) => {
            return (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${level - 1 >= index ? "bg-green-600" : "bg-slate-500"}`}
              />
            );
          })}
        </div>

        <IconLabel
          className="text-lg font-bold gap-4 mt-2"
          imageUri={ResearchImage.get(researchId) ?? ""}
          text={name}
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
      <Button
        className="btn-sm btn-secondary"
        disabled={!canUpgrade}
        loading={userClickedLoading}
        onClick={executeResearch}
      >
        Upgrade
      </Button>
      {error && <p className="text-xs text-error animate-pulse uppercase py-1">{error}</p>}
    </SecondaryCard>
  );
});
