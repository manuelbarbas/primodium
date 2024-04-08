import { Account } from "src/network/components/clientComponents";

import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SecondaryCard } from "src/components/core/Card";
import { components as comps } from "src/network/components";

import { useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { ObjectiveEntityLookup } from "src/util/constants";
import { Hex } from "viem";
import { Objective } from "./Objective";

export const ClaimedObjectives: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const player = Account.use()?.value ?? singletonEntity;
  const asteroidEntity = comps.ActiveRock.use()?.value;

  const filteredObjectiveEntities = Object.values(ObjectiveEntityLookup).filter((objective) => {
    const claimed =
      comps.CompletedObjective.getWithKeys({ entity: player as Hex, objective: objective as Hex })?.value ?? false;

    return claimed;
  });

  const paginatedObjectiveEntities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredObjectiveEntities.slice(start, end);
  }, [filteredObjectiveEntities, currentPage]);

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(startIdx + itemsPerPage + 1, filteredObjectiveEntities.length);

  if (!asteroidEntity || player === singletonEntity) return <></>;
  if (filteredObjectiveEntities.length === 0)
    return (
      <SecondaryCard className="w-full h-full items-center justify-center text-xs">
        <p className="opacity-50 font-bold">NO COMPLETED OBJECTIVES</p>
      </SecondaryCard>
    );

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="grid grid-cols-2 grid-rows-3 gap-2 w-full h-full">
        {paginatedObjectiveEntities.map((objectiveEntity, i) => {
          return <Objective key={i} objectiveEntity={objectiveEntity} asteroidEntity={asteroidEntity} />;
        })}
      </div>
      {filteredObjectiveEntities.length > 6 && (
        <div className="flex items-center gap-2">
          <Button
            className="btn-sm btn-primary"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
          </Button>
          <Button
            className="btn-sm btn-primary"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage * itemsPerPage >= filteredObjectiveEntities.length}
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
