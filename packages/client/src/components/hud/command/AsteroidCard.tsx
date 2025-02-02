import { InterfaceIcons } from "@primodiumxyz/assets";
import { entityToRockName, formatTimeShort, hashEntities, Keys } from "@primodiumxyz/core";
import { useAccountClient, useCore, useInGracePeriod, useSyncStatus } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";
import { SecondaryCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { Loader } from "@/components/core/Loader";
import { AsteroidStats } from "@/components/hud/command/overview/AsteroidStatsAndActions";
import { AccountDisplay } from "@/components/shared/AccountDisplay";
import { useAsteroidEmblem } from "@/hooks/image/useAsteroidEmblem";
import { useAsteroidImage } from "@/hooks/image/useAsteroidImage";

const filter =
  "drop-shadow(1px 0px 0px #FF3232) drop-shadow(-1px  0px 0px #FF3232) drop-shadow( 0px  1px 0px #FF3232) drop-shadow( 0px -1px 0px #FF3232)";

export const AsteroidCard: React.FC<{ entity: Entity }> = ({ entity }) => {
  const { tables } = useCore();
  const { loading } = useSyncStatus(hashEntities(Keys.SELECTED, entity));
  const name = entityToRockName(entity);
  const { inGracePeriod, duration } = useInGracePeriod(entity, loading);

  const ownerPlayer = tables.OwnedBy.use(entity)?.value as Entity | undefined;
  const playerEntity = useAccountClient().playerAccount.entity;
  const friendly = ownerPlayer === playerEntity;
  const emblem = useAsteroidEmblem(entity);
  const image = useAsteroidImage(entity);

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
            <img src={emblem} className="w-8 h-8 translate-y-2" />
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
          <img src={image} className="w-18 h-18 -mt-6" style={friendly ? {} : { filter }} />
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
