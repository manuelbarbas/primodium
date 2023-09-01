import { useCallback, useMemo, useState } from "react";
import { EntityID } from "@latticexyz/recs";

import { getRecipe } from "../../../util/resource";
import { ResearchImage, ResourceImage } from "../../../util/constants";
import { useAccount } from "../../../hooks/useAccount";
import { hashAndTrimKeyEntity } from "../../../util/encode";
import ResourceIconTooltip from "../../shared/ResourceIconTooltip";
import {
  getBuildingResearchRequirement,
  ResearchItemType,
} from "../../../util/research";
import { GameButton } from "src/components/shared/GameButton";
import React from "react";
import { research } from "src/util/web3";
import {
  Level,
  MainBase,
  HasResearched,
} from "src/network/components/chainComponents";
import { useObservableValue } from "@latticexyz/react";
import { SingletonID } from "@latticexyz/network";
import { useMud } from "src/hooks";
import Spinner from "src/components/shared/Spinner";
import { getBlockTypeName } from "src/util/common";

export const ResearchItem: React.FC<{ data: ResearchItemType }> = React.memo(
  ({ data }) => {
    // fetch whether research is completed
    const network = useMud();
    const { address } = useAccount();
    const { name, levels, description } = data;

    //we assume the order of this loop will never change. TODO: pull out into component since this is a nono
    useObservableValue(HasResearched.update$);
    const levelsResearched = levels.map(({ id }) => {
      const entity = hashAndTrimKeyEntity(id, address);
      const isResearched = HasResearched.get(entity);
      return isResearched?.value ?? false;
    });

    let currentLevel =
      levelsResearched.filter(Boolean).length >= levels.length
        ? levels.length
        : levelsResearched.filter(Boolean).length;

    const isResearched = currentLevel === levels.length;

    const researchId =
      levels[isResearched ? currentLevel - 1 : currentLevel].id;
    const subtitle =
      levels[isResearched ? currentLevel - 1 : currentLevel].subtitle;

    const researchRequirement = useMemo(() => {
      return getBuildingResearchRequirement(researchId);
    }, [researchId]);

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
      await research(researchId, network);

      setUserClickedLoading(false);
    }, []);

    const recipe = getRecipe(researchId);

    return (
      <div className="relative min-w-64 border border-cyan-600 mb-3 mr-3 bg-slate-700 bg-gradient-to-b from-transparent to-slate-900/20 rounded-md">
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex flex-col w-full border-b border-cyan-600 pb-4">
              <div className="absolute top-0 right-0">
                {levelsResearched.map((isResearched, index) => {
                  return (
                    <div
                      key={index}
                      className={`m-1 w-2 h-2 rounded-full ${
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
                    const resourceName = getBlockTypeName(resource.id);
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

            <div className="text-xs text-center bg-slate-800 py-4 px-1 italic border-b border-cyan-700 ">
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
  }
);
