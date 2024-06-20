import { FaChevronLeft, FaChevronRight, FaInfoCircle } from "react-icons/fa";
import { UnitUpgrade } from "../widgets/UnitUpgrade";
import { useMemo, useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { EntityType } from "@primodiumxyz/core";

export const UnitUpgrades: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  const unitEntities = [
    EntityType.AnvilDrone,
    EntityType.HammerDrone,
    EntityType.StingerDrone,
    EntityType.AegisDrone,
    EntityType.MinutemanMarine,
    EntityType.TridentMarine,
    EntityType.LightningCraft,
  ];

  const paginatedEntities = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return unitEntities.slice(start, end);
  }, [unitEntities, currentPage]);

  const startIdx = currentPage * itemsPerPage + 1;
  const endIdx = Math.min(startIdx + itemsPerPage - 1, unitEntities.length);

  return (
    <Card className="w-[44rem]">
      <p className="opacity-50 text-xs italic mb-4 flex gap-2 z-10">
        <FaInfoCircle size={16} /> All fleets owned by this asteroid will have their units upgraded.
      </p>
      <div className="flex flex-col gap-4 w-full h-full">
        <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full">
          {paginatedEntities.map((entity, i) => (
            <UnitUpgrade unit={entity} key={`entity-${i}`} />
          ))}
        </div>
        {unitEntities.length > itemsPerPage && (
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
              disabled={(currentPage + 1) * itemsPerPage >= unitEntities.length}
            >
              <FaChevronRight />
            </Button>
            <p className="text-xs font-bold opacity-50 inline">
              {startIdx} - {endIdx} / {unitEntities.length}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
