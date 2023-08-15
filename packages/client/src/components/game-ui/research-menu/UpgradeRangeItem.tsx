import { useCallback, useMemo, useState } from "react";
import { EntityID } from "@latticexyz/recs";

import { getRecipe } from "../../../util/resource";
import {
  BlockIdToKey,
  ResearchImage,
  ResourceImage,
} from "../../../util/constants";
import { useAccount } from "../../../hooks/useAccount";
import { hashAndTrimKeyEntity } from "../../../util/encode";
import ResourceIconTooltip from "../../shared/ResourceIconTooltip";
import {
  ExpansionResearchTree,
  getBuildingResearchRequirement,
} from "../../../util/research";
import { GameButton } from "src/components/shared/GameButton";
import React from "react";
import { research, upgradeRange } from "src/util/web3";
import {
  Level,
  MainBase,
  HasResearched,
} from "src/network/components/chainComponents";
import { SingletonID } from "@latticexyz/network";
import { useMud } from "src/hooks";
import Spinner from "src/components/shared/Spinner";

export const UpgradeRangeItem = React.memo(() => {
  // fetch whether research is completed
  const network = useMud();
  const { address } = useAccount();
  const { name, description, levels } = ExpansionResearchTree;

  const level = Level.get(address, { value: 0 }).value;
  console.log("level", level);

  const isResearched = level === levels.length;
  const researchId = levels[isResearched ? level - 1 : level].id;
  const subtitle = levels[isResearched ? level - 1 : level].subtitle;

  console.log("researchId", researchId);
  console.log("subtitle", subtitle);
  const researchRequirement = useMemo(() => {
    return getBuildingResearchRequirement(researchId);
  }, [researchId]);

  console.log("req", researchRequirement);
  const researchOwner = useMemo(() => {
    if (address == null || researchRequirement == null) return SingletonID;
    return hashAndTrimKeyEntity(researchRequirement as EntityID, address);
  }, [researchRequirement, address]);

  const isResearchRequirementsMet = useMemo(
    () => HasResearched.get(researchOwner)?.value ?? false,
    [researchOwner]
  );

  //TODO: make main base a hook and only render this component when main base isnt undefined
  const mainBaseEntity = MainBase.use(address, {
    value: "-1" as EntityID,
  }).value;

  const mainBaseLevel = Level.use(mainBaseEntity, {
    value: 0,
  }).value;
  const requiredMainBaseLevel = Level.use(researchId, {
    value: 0,
  }).value;

  const isMainBaseLevelRequirementsMet = useMemo(() => {
    return mainBaseLevel >= requiredMainBaseLevel;
  }, [mainBaseLevel, requiredMainBaseLevel]);

  // Check if building can be researched
  const isLocked = useMemo(() => {
    return (
      (researchRequirement != null && !isResearchRequirementsMet) ||
      !isMainBaseLevelRequirementsMet
    );
  }, [
    isResearchRequirementsMet,
    researchRequirement,
    isMainBaseLevelRequirementsMet,
  ]);
  // New state so not every other research item button shows loading when only current research button is clicked.
  const [userClickedLoading, setUserClickedLoading] = useState(false);

  const executeResearch = useCallback(async () => {
    setUserClickedLoading(true);
    await upgradeRange(network);
    setUserClickedLoading(false);
  }, []);

  const recipe = getRecipe(researchId);
  console.log("recipe:", recipe);

  return (
    <div className="relative min-w-64 border border-cyan-600 mb-3 mr-3 bg-slate-900">
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex flex-col w-full border-b border-cyan-600 pb-4">
            <div className="absolute top-0 right-0">
              {new Array(levels.length).fill(0).map((_, index) => {
                const isResearched = level > index;
                return (
                  <div
                    key={index}
                    className={`m-1 w-2 h-2 ${
                      isResearched ? "bg-green-600" : "bg-slate-500"
                    }`}
                  />
                );
              })}
            </div>
            <div className="mt-4 w-16 h-16 mx-auto">
              <img
                src={ResearchImage.get(researchId)}
                className="w-16 h-16 mx-auto pixel-images "
              ></img>
            </div>
            <div className="mt-4 text-center font-bold">{name}</div>
            <div className="mt-1 text-center text-md font-bold text-slate-100/50">
              {subtitle}
            </div>
            {!isResearched && (
              <div className="mt-2 flex justify-center items-center text-sm">
                {recipe.map((resource) => {
                  const resourceImage = ResourceImage.get(resource.id)!;
                  const resourceName = BlockIdToKey[resource.id];
                  return (
                    <ResourceIconTooltip
                      key={resource.id}
                      image={resourceImage}
                      resourceId={resource.id}
                      name={resourceName}
                      amount={resource.amount}
                    />
                  );
                })}
              </div>
            )}
            {isResearched && (
              <div className="mt-2 flex justify-center items-center text-sm">
                Max Level
              </div>
            )}
          </div>

          <div className="text-xs text-center bg-slate-900 py-4 px-1 italic ">
            {description}
          </div>
        </div>

        <div className="my-4">
          {isResearched && (
            <GameButton className=" bg-slate-400 text-sm w-3/4" disable>
              <p className="px-2 py-1"> Researched </p>
            </GameButton>
          )}
          {isLocked && (
            <GameButton className=" bg-slate-400 text-sm w-3/4" disable>
              <p className="px-2 py-1">
                Lvl. {requiredMainBaseLevel} Base Required
              </p>
            </GameButton>
          )}
          {!isLocked && !isResearched && (
            <GameButton
              id={`${name}-research`}
              onClick={executeResearch}
              className=" bg-cyan-600 text-sm w-3/4"
            >
              <div className="px-2 py-1">
                {userClickedLoading ? <Spinner /> : "Research"}
              </div>
            </GameButton>
          )}
        </div>
      </div>
    </div>
  );
});
