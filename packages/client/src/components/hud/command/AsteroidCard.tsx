import { Entity } from "@latticexyz/recs";
import { IconLabel } from "src/components/core/IconLabel";
import { Loader } from "src/components/core/Loader";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { useInGracePeriod } from "src/hooks/useInGracePeriod";
import { useSyncStatus } from "src/hooks/useSyncStatus";
import { components } from "src/network/components";
import { Keys } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { entityToRockName } from "src/util/name";
import { formatTimeShort } from "src/util/number";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { SecondaryCard } from "@/components/core/Card";
import { getAsteroidEmblem, getAsteroidImage } from "@/util/asteroid";
import { useGame } from "@/hooks/useGame";
import { AsteroidStats } from "@/components/hud/command/overview/AsteroidStatsAndActions";

export const AsteroidCard: React.FC<{ entity: Entity }> = ({ entity }) => {
  const game = useGame();
  const { loading } = useSyncStatus(hashEntities(Keys.SELECTED, entity));
  const name = entityToRockName(entity);
  const { inGracePeriod, duration } = useInGracePeriod(entity, loading);

  const ownedBy = components.OwnedBy.use(entity)?.value as Entity | undefined;

  if (loading)
    return (
      <div className="relative flex items-center justify-center w-60 h-24 px-auto uppercase font-bold">
        <Loader />
        Loading Data
      </div>
    );

  return (
    <SecondaryCard className="w-full">
      <div className="flex flex-col gap-1 z-10">
        <div className="flex flex-col gap-1">
          <div className="flex gap-1 items-center">
            <img src={getAsteroidEmblem(game, entity)} className="w-8 h-8 translate-y-2" />
            <div className="flex flex-col">
              <p className="text-md font-bold uppercase">{name}</p>
              {ownedBy ? <AccountDisplay className="w-fit" noColor player={ownedBy} /> : "DROID INFESTED"}
            </div>
          </div>
        </div>
        <div className="flex gap-1 justify-center items-center">
          <img src={getAsteroidImage(game, entity)} className="w-18 h-18 -mt-6" />
        </div>
        {inGracePeriod && (
          <div className="flex gap-2 p-1 justify-center items-center h-4 w-full text-accent text-xs">
            <IconLabel imageUri={InterfaceIcons.Grace} className={`pixel-images w-3 h-3`} />
            Protected for {formatTimeShort(duration)}
          </div>
        )}
        {!inGracePeriod && <AsteroidStats asteroid={entity} segments={7} />}
      </div>
    </SecondaryCard>
  );
};
