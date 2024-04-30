import { Button } from "@/components/core/Button";
import { UnitStatus } from "@/components/hud/widgets/battle-reports/UnitStatus";
import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useMemo, useState } from "react";
import { components } from "src/network/components";
import { entityToFleetName, entityToRockName } from "src/util/name";

type BattleData = Exclude<ReturnType<typeof components.Battle.getParticipant>, undefined>;
export const BattleAllies = ({ allies }: { allies: (BattleData | undefined)[] }) => {
  const [openAlly, setOpenAlly] = useState<Entity | null>(null);

  const openAllyData = useMemo(() => {
    if (!openAlly) return;
    return allies.find((ally) => ally && ally.entity === openAlly);
  }, [openAlly, allies]);

  if (allies.length === 0) return;
  return (
    <div className="flex w-full gap-4">
      <p className="w-60 pt-2 text-xs font-bold text-accent text-right">ALLIES</p>
      <div className="flex flex-col w-full gap-1">
        <div className="grid grid-cols-4 gap-1">
          {allies.map(
            (ally, i) =>
              !!ally && (
                <Ally
                  key={`ally-${ally}-${i}`}
                  entity={ally.entity as Entity}
                  selected={openAlly === ally.entity}
                  onClick={() => (openAlly === ally.entity ? setOpenAlly(null) : setOpenAlly(ally.entity as Entity))}
                />
              )
          )}
        </div>
        {openAllyData && <UnitStatus data={openAllyData.units} />}
      </div>
    </div>
  );
};

const Ally = ({ selected, entity, onClick }: { selected: boolean; entity: Entity; onClick?: () => void }) => {
  const isFleet = components.IsFleet.use(entity)?.value;
  return (
    <Button
      onClick={onClick}
      size="content"
      className={`flex bg-black/10 border text-xs justify-center items-center gap-2 p-1 w-full border-secondary/50`}
      selected={selected}
    >
      <img src={isFleet ? InterfaceIcons.Outgoing : InterfaceIcons.Asteroid} className="w-6" />
      {isFleet ? entityToFleetName(entity, true) : entityToRockName(entity)}
    </Button>
  );
};
