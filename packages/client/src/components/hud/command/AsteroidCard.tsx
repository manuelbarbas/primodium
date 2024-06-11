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
import { useGame } from "@/react/hooks/useGame";
import { AsteroidStats } from "@/components/hud/command/overview/AsteroidStatsAndActions";
import { useMud } from "@/react/hooks";
const filter =
  "drop-shadow(1px 0px 0px #FF3232) drop-shadow(-1px  0px 0px #FF3232) drop-shadow( 0px  1px 0px #FF3232) drop-shadow( 0px -1px 0px #FF3232)";

export const AsteroidCard: React.FC<{ entity: Entity }> = ({ entity }) => {
  const game = useGame();
  const { loading } = useSyncStatus(hashEntities(Keys.SELECTED, entity));
  const name = entityToRockName(entity);
  const { inGracePeriod, duration } = useInGracePeriod(entity, loading);

  const ownerPlayer = components.OwnedBy.use(entity)?.value as Entity | undefined;
  const playerEntity = useMud().playerAccount.entity;
  const friendly = ownerPlayer === playerEntity;

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
              <p className="text-md font-bold uppercase">
                {name}
                {!friendly && <span className="bg-error ml-1 text-[0.6rem] uppercase px-1">hostile</span>}
              </p>
              {ownerPlayer ? <AccountDisplay className="w-fit" noColor player={ownerPlayer} /> : "DROID INFESTED"}
            </div>
          </div>
        </div>
        <div className="flex gap-1 justify-center items-center">
          <img src={getAsteroidImage(game, entity)} className="w-18 h-18 -mt-6" style={friendly ? {} : { filter }} />
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
