import { EntityToResourceImage } from "@/util/mappings";
import { Entity } from "@latticexyz/recs";
import { InterfaceIcons, ResourceImages } from "@primodiumxyz/assets";
import { Badge } from "src/components/core/Badge";
import { IconLabel } from "src/components/core/IconLabel";
import { Loader } from "src/components/core/Loader";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { useShardAsteroid } from "src/hooks/primodium/useShardAsteroid";
import { useSyncStatus } from "src/hooks/useSyncStatus";
import { components } from "src/network/components";
import { EntityType, Keys } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { entityToRockName } from "src/util/name";
import { formatResourceCount, formatTime } from "src/util/number";
import { HealthBar } from "../../../shared/HealthBar";

export const ShardAsteroidHover: React.FC<{ entity: Entity }> = ({ entity }) => {
  const { loading } = useSyncStatus(hashEntities(Keys.SELECTED, entity));
  const name = entityToRockName(entity);

  const shardData = useShardAsteroid(entity);

  const ownedBy = components.OwnedBy.use(entity)?.value as Entity | undefined;

  if (loading)
    return (
      <div className="relative w-56 h-24 px-auto uppercase font-bold">
        <div className="flex h-full justify-center items-center gap-2">
          <Loader />
          Loading Data
        </div>
      </div>
    );

  if (!shardData)
    return (
      <div className="relative flex justify-center items-center w-56 h-24 px-auto uppercase font-bold">
        No data found...
      </div>
    );

  return (
    <div>
      <div className="absolute top-0 left-0 w-full h-full topographic-background-sm opacity-50 " />
      <div className="flex flex-col gap-1 z-10">
        <div className="grid grid-cols-2 gap-1">
          <div className="flex gap-1 items-center">
            <IconLabel imageUri={InterfaceIcons.Asteroid} className={`pixel-images w-3 h-3 bg-base-100`} />
            <p className="text-sm font-bold uppercase">{name}</p>
          </div>
        </div>
        <div className="flex victory-bg uppercase text-primary font-bold border border-secondary/50 text-sm justify-center items-center">
          {formatResourceCount(EntityType.Iron, shardData.points).toLocaleString()} PRI EXPLOSION
          {shardData.canExplode ? " IMMINENT" : ` IN ${formatTime(shardData.timeUntilExplode)}`}
        </div>
        <div className="flex gap-1">
          <div className="flex bg-neutral uppercase font-bold border border-secondary/50 gap-2 text-xs p-1 items-center h-4">
            Volatile Shard
          </div>

          {ownedBy && (
            <div className="flex bg-primary uppercase font-bold border border-secondary/50 gap-2 text-xs p-1 items-center h-4 max-w-48">
              <AccountDisplay className="w-12" noColor player={ownedBy} raw />
            </div>
          )}
          {shardData.dripPerSec > 0n && (
            <div className="flex bg-neutral uppercase font-bold border border-secondary/50 gap-2 text-xs p-1 items-center h-4">
              {/* todo replace PRI with icon */}
              <IconLabel imageUri={ResourceImages.Primodium} />
              {formatResourceCount(EntityType.Iron, shardData.dripPerSec * 60n * 60n, {
                notLocale: true,
                fractionDigits: 1,
              }).toLocaleString()}
              /HR
            </div>
          )}
        </div>
        {shardData.unclaimedPoints > 0n && (
          <div className="flex bg-neutral uppercase font-bold border border-secondary/50 gap-2 text-xs p-1 items-center h-4">
            {/* todo replace PRI with icon */}
            <IconLabel imageUri={ResourceImages.Primodium} />
            {formatResourceCount(EntityType.Iron, shardData.unclaimedPoints, {
              notLocale: true,
              fractionDigits: 1,
            }).toLocaleString()}{" "}
            unclaimed points
          </div>
        )}
        <Badge className="w-full text-xs text-accent bg-base-100 p-1 border border-secondary">
          <HealthBar
            imgUrl={EntityToResourceImage[EntityType.Encryption]}
            health={Number(formatResourceCount(EntityType.Encryption, shardData.encryption, { notLocale: true })) || 0}
            maxHealth={
              Number(formatResourceCount(EntityType.Encryption, shardData.maxEncryption, { notLocale: true })) || 0
            }
          />
        </Badge>
      </div>
    </div>
  );
};
