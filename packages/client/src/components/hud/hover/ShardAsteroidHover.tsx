import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { IconLabel } from "src/components/core/IconLabel";
import { Loader } from "src/components/core/Loader";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { useShardAsteroid } from "src/hooks/conquest/useShardAsteroid";
import { useSyncStatus } from "src/hooks/useSyncStatus";
import { components } from "src/network/components";
import { EntityType, Keys, ResourceImage } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { entityToRockName } from "src/util/name";
import { formatResourceCount, formatTime } from "src/util/number";
import { Card } from "../../core/Card";
import { HealthBar } from "../HealthBar";
import { AsteroidEta } from "./AsteroidEta";

export const ShardAsteroidHover: React.FC<{ entity: Entity }> = ({ entity }) => {
  const { loading } = useSyncStatus(hashEntities(Keys.SELECTED, entity));
  const name = entityToRockName(entity);

  const conquestData = useShardAsteroid(entity);

  const ownedBy = components.OwnedBy.use(entity)?.value as Entity | undefined;

  if (loading)
    return (
      <Card className="relative flex items-center justify-center w-56 h-24 px-auto uppercase font-bold">
        <Loader />
        Loading Data
      </Card>
    );

  if (!conquestData)
    return (
      <Card className="relative flex items-center justify-center w-56 h-24 px-auto uppercase font-bold">
        No data found...
      </Card>
    );

  return (
    <Card className="ml-5 w-72 relative">
      <div className="absolute top-0 left-0 w-full h-full topographic-background-sm opacity-50 " />
      <div className="flex flex-col gap-1 z-10">
        <div className="grid grid-cols-2 gap-1">
          <div className="flex gap-1 items-center">
            <IconLabel imageUri="/img/icons/asteroidicon.png" className={`pixel-images w-3 h-3 bg-base-100`} />
            <p className="text-sm font-bold uppercase">{name}</p>
          </div>
          <AsteroidEta entity={entity} />
        </div>
        <div className="flex victory-bg uppercase text-primary font-bold border border-secondary/50 text-sm flex justify-center items-center">
          {formatResourceCount(EntityType.Iron, conquestData.points, { notLocale: true }).toLocaleString()} PRI
          EXPLOSION
          {conquestData.canExplode ? " IMMINENT" : ` IN ${formatTime(conquestData.timeUntilExplode)}`}
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
          {conquestData.dripPerSec > 0n && (
            <div className="flex bg-neutral uppercase font-bold border border-secondary/50 gap-2 text-xs p-1 items-center h-4">
              {/* todo replace PRI with icon */}
              {formatResourceCount(EntityType.Iron, conquestData.dripPerSec * 60n * 60n, {
                notLocale: true,
                fractionDigits: 1,
              }).toLocaleString()}{" "}
              PRI/HR
            </div>
          )}
        </div>
        {conquestData.unclaimedPoints > 0n && (
          <div className="flex bg-neutral uppercase font-bold border border-secondary/50 gap-2 text-xs p-1 items-center h-4">
            {/* todo replace PRI with icon */}
            {formatResourceCount(EntityType.Iron, conquestData.unclaimedPoints, {
              notLocale: true,
              fractionDigits: 1,
            }).toLocaleString()}
            unclaimed points
          </div>
        )}
        <Badge className="w-full text-xs text-accent bg-base-100 p-1 border border-secondary">
          <HealthBar
            imgUrl={ResourceImage.get(EntityType.Encryption) ?? ""}
            health={Number(formatResourceCount(EntityType.Encryption, conquestData.encryption, { notLocale: true }))}
            maxHealth={Number(
              formatResourceCount(EntityType.Encryption, conquestData.maxEncryption, { notLocale: true })
            )}
          />
        </Badge>
      </div>
    </Card>
  );
};
