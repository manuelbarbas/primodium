import { Entity } from "@latticexyz/recs";

import { Time } from "src/network/components/clientComponents";

import { useMemo } from "react";

import { FaGift, FaMedal, FaSpinner } from "react-icons/fa";
import { Badge } from "src/components/core/Badge";
import { SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { getEntityTypeName } from "src/util/common";

import { BackgroundImage, ResourceImage, ResourceType } from "src/util/constants";
import { formatNumber } from "src/util/number";
import { getRewards } from "src/util/objectives/getHasRequiredRewards";
import { getAllObjectiveRequirements, isAllRequirementsMet } from "src/util/objectives/objectiveRequirements";
import { getObjective } from "src/util/objectives/objectives";
import { getFullResourceCount } from "src/util/resource";
import { ClaimObjectiveButton } from "./ClaimObjectiveButton";

export const Objective: React.FC<{
  objectiveEntity: Entity;
  asteroidEntity: Entity;
  highlight?: boolean;
}> = ({ objectiveEntity, asteroidEntity, highlight = false }) => {
  const time = Time.use()?.value;

  const objectiveName = getEntityTypeName(objectiveEntity);

  const objectiveDescription = getObjective(objectiveEntity)?.description ?? "A Primodium objective.";
  const rewardRecipe = getRewards(objectiveEntity);

  const requirements = useMemo(
    () => getAllObjectiveRequirements(asteroidEntity, objectiveEntity),
    [asteroidEntity, time, objectiveEntity]
  );

  const complete = isAllRequirementsMet(requirements);
  return (
    <SecondaryCard
      className={`text-xs w-full flex flex-col justify-between ${highlight ? "border border-warning" : ""}`}
    >
      <div>
        <div className="grid grid-cols-10">
          <div className="flex items-center col-span-1">
            <FaMedal className="text-accent" />
          </div>
          <p className=" col-span-7 font-bold flex items-center px-1">{objectiveName}</p>
        </div>

        <div className="flex flex-wrap gap-1 items-center">
          <hr className="border-t border-accent/20 w-full mb-1 mt-3" />
          <p className=" col-span-7 flex items-center px-1 opacity-75 font-normal">{objectiveDescription}</p>
          <hr className="border-t border-accent/20 w-full mb-1 mt-3" />
          <div className="col-span-10 w-full flex flex-wrap gap-1">
            <span className="flex gap-1 items-center opacity-75">
              <FaSpinner /> PROGRESS:
            </span>
            <div className="flex flex-wrap gap-1">
              {requirements.map((_req, index) => {
                const value = _req.currentValue > _req.requiredValue ? _req.requiredValue : _req.currentValue;
                const backgroundImage = _req.resourceEntity
                  ? ResourceImage.get(_req.resourceEntity) ?? BackgroundImage.get(_req.resourceEntity)?.at(0)
                  : undefined;

                return (
                  <Badge key={index} className={`text-xs gap-2 ${complete ? "badge-success" : "badge-neutral"}`}>
                    <IconLabel
                      imageUri={backgroundImage ?? "/img/icons/minersicon.png"}
                      text={formatNumber(value / _req.scale, { short: true, fractionDigits: 3 })}
                      tooltipDirection={"top"}
                      tooltipText={_req.tooltipText ?? ""}
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
          {rewardRecipe && rewardRecipe.length !== 0 && (
            <div className="col-span-10 w-full flex flex-wrap gap-1">
              <span className="flex gap-1 items-center opacity-75">
                <FaGift /> REWARDS:
              </span>

              {rewardRecipe.map((resource) => {
                let canClaim = true;
                if (resource.type === ResourceType.Resource) {
                  const { resourceCount, resourceStorage: maxStorage } = getFullResourceCount(
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
                      image={ResourceImage.get(resource.id) ?? BackgroundImage.get(resource.id)?.at(0) ?? ""}
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
