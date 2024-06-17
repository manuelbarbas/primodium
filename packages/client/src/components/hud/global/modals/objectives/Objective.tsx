import { Entity } from "@primodiumxyz/reactive-tables";

import { useMemo } from "react";

import { FaGift, FaMedal, FaSpinner } from "react-icons/fa";
import { Badge } from "@/components/core/Badge";
import { SecondaryCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { ResourceIconTooltip } from "@/components/shared/ResourceIconTooltip";

import { InterfaceIcons } from "@primodiumxyz/assets";
import { getRewards } from "@/util/objectives/getHasRequiredRewards";
import { objectiveCategoryColors } from "@/util/objectives/objectiveCategoryColors";
import { getAllObjectiveRequirements } from "@/util/objectives/objectiveRequirements";
import { getObjective } from "@/util/objectives/objectives";
import { ClaimObjectiveButton } from "./ClaimObjectiveButton";
import { useCore } from "@primodiumxyz/core/react";
import { formatNumber, getEntityTypeName, ResourceType } from "@primodiumxyz/core";
import { EntityToResourceImage, EntityToUnitImage } from "@/util/image";

export const Objective: React.FC<{
  objectiveEntity: Entity;
  asteroidEntity: Entity;
  highlight?: boolean;
  claimed?: boolean;
}> = ({ objectiveEntity, asteroidEntity, claimed, highlight = false }) => {
  const core = useCore();
  const { tables, utils } = core;
  const playerEntity = tables.Account.use()?.value;
  const time = tables.Time.use()?.value;

  const objectiveName = getEntityTypeName(objectiveEntity);
  const objective = getObjective(objectiveEntity);
  const description = objective?.description ?? "A Primodium objective.";
  const rewardRecipe = getRewards(core, objectiveEntity);

  const requirements = useMemo(
    () => (playerEntity ? getAllObjectiveRequirements(core, playerEntity, asteroidEntity, objectiveEntity) : []),
    [asteroidEntity, time, playerEntity, objectiveEntity]
  );

  return (
    <SecondaryCard
      className={`text-xs relative w-full flex flex-col justify-between ${highlight ? "border border-warning" : ""}`}
    >
      <div>
        <div className="grid grid-cols-10">
          <div className="flex items-center col-span-6 gap-1">
            <FaMedal className="text-accent" />
            <p className="col-span-5 font-bold flex items-center px-1">{objectiveName}</p>
          </div>
          {objective && (
            <div className={`col-span-4`}>
              <p
                className={`text-center text-white/80 font-bold text-xs uppercase py-1 px-2 ${
                  objectiveCategoryColors[objective.category]
                }`}
              >
                {objective.category}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 items-center">
          <hr className="border-t border-accent/20 w-full my-1" />
          <p className=" col-span-7 flex items-center px-1 opacity-75 font-normal">{description}</p>
          <hr className="border-t border-accent/20 w-full my-1" />
          {!claimed && (
            <div className="col-span-10 w-full flex flex-wrap gap-1">
              <span className="flex gap-1 items-center opacity-75">
                <FaSpinner /> PROGRESS:
              </span>
              <div className="flex flex-wrap gap-1">
                {requirements.map((_req, index) => {
                  const reqComplete = _req.currentValue >= _req.requiredValue;
                  const value = _req.currentValue > _req.requiredValue ? _req.requiredValue : _req.currentValue;
                  if (_req.isBool) {
                    return (
                      <Badge key={index} className={`text-xs gap-2 ${reqComplete ? "badge-success" : "badge-neutral"}`}>
                        <IconLabel
                          imageUri={_req.backgroundImage ?? InterfaceIcons.Build}
                          text={reqComplete ? "Complete" : "Incomplete"}
                          className="text-xs font-bold"
                        />
                      </Badge>
                    );
                  }
                  return (
                    <Badge key={index} className={`text-xs gap-2 ${reqComplete ? "badge-success" : "badge-neutral"}`}>
                      <IconLabel
                        imageUri={_req.backgroundImage ?? InterfaceIcons.Build}
                        text={formatNumber(value / _req.scale, { short: true, fractionDigits: 3 })}
                        className="text-xs font-bold"
                      />

                      <span className="font-bold">
                        / {formatNumber(_req.requiredValue / _req.scale, { short: true, fractionDigits: 1 })}
                      </span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          {rewardRecipe && rewardRecipe.length !== 0 && (
            <div className="col-span-10 w-full flex flex-wrap gap-1">
              <span className="flex gap-1 items-center opacity-75">
                <FaGift /> REWARDS:
              </span>

              {rewardRecipe.map((resource) => {
                let canClaim = true;
                if (resource.type === ResourceType.Resource) {
                  const { resourceCount, resourceStorage: maxStorage } = utils.getResourceCount(
                    resource.id,
                    asteroidEntity
                  );
                  canClaim = resourceCount + resource.amount <= maxStorage;
                }
                return (
                  <Badge
                    key={resource.id}
                    className={`text-xs gap-2 badge-neutral ${!canClaim ? "border-error opacity-60 bg-error" : ""}`}
                  >
                    <ResourceIconTooltip
                      name={getEntityTypeName(resource.id)}
                      image={EntityToResourceImage[resource.id] ?? EntityToUnitImage[resource.id] ?? ""}
                      resource={resource.id}
                      amount={resource.amount}
                      resourceType={resource.type}
                      direction="top"
                    />
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ClaimObjectiveButton objectiveEntity={objectiveEntity} />
    </SecondaryCard>
  );
};
