import { Entity } from "@latticexyz/recs";

import { useMemo, useState } from "react";

import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SecondaryCard } from "src/components/core/Card";
import { components } from "src/network/components";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { ObjectiveEntityLookup } from "src/util/constants";
import { canShowObjective } from "src/util/objectives/objectiveRequirements";
import { Hex } from "viem";
import { Objective } from "./Objective";

export const UnclaimedObjectives: React.FC<{ highlight?: Entity }> = ({ highlight }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const player = components.Account.use()?.value ?? singletonEntity;
  const asteroidEntity = components.ActiveRock.use()?.value;
  const time = components.Time.use()?.value;
  const objectives = Object.values(ObjectiveEntityLookup);

  const filteredObjectiveEntities = useMemo(() => {
    if (!asteroidEntity) return [];
    return objectives.filter((objective) => {
      const canShow = canShowObjective(player, objective);

      const claimed =
        components.CompletedObjective.getWithKeys({ entity: player as Hex, objective: objective as Hex })?.value ??
        false;

      return canShow && !claimed;
    });
  }, [time, asteroidEntity]);

  const paginatedObjectiveEntities = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredObjectiveEntities.slice(start, end);
  }, [filteredObjectiveEntities, currentPage]);

  const startIdx = currentPage * itemsPerPage + 1;
  const endIdx = Math.min(startIdx + itemsPerPage - 1, filteredObjectiveEntities.length);
  if (!asteroidEntity || player === singletonEntity) return <></>;

  if (filteredObjectiveEntities.length === 0)
    return (
      <SecondaryCard className="w-full h-full items-center justify-center text-xs">
        <p className="opacity-50 font-bold">NO OBJECTIVES AVAILABLE</p>
      </SecondaryCard>
    );

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="grid grid-cols-2 grid-rows-3 gap-2 w-full h-full">
        {paginatedObjectiveEntities.map((objectiveEntity, i) => (
          <Objective
            key={i}
            objectiveEntity={objectiveEntity}
            highlight={objectiveEntity === highlight}
            asteroidEntity={asteroidEntity}
          />
        ))}
      </div>
      {filteredObjectiveEntities.length > 6 && (
        <div className="flex items-center gap-2">
          <Button
            className="btn-sm btn-primary"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <FaChevronLeft />
          </Button>
          <Button
            className="btn-sm btn-primary"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={(currentPage + 1) * itemsPerPage >= filteredObjectiveEntities.length - 1}
          >
            <FaChevronRight />
          </Button>
          <p className="text-xs font-bold opacity-50 inline">
            {startIdx} - {endIdx} / {filteredObjectiveEntities.length}
          </p>
        </div>
      )}
    </div>
  );
};
