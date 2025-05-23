import { InterfaceIcons, ResourceImages } from "@primodiumxyz/assets";
import {
  entityToRockName,
  EntityType,
  formatResourceCount,
  formatTimeShort,
  hashEntities,
  Keys,
} from "@primodiumxyz/core";
import { useCore, useResourceCount, useShardAsteroid, useSyncStatus } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";
import { CapacityBar } from "@/components/core/CapacityBar";
import { IconLabel } from "@/components/core/IconLabel";
import { Loader } from "@/components/core/Loader";
import { AccountDisplay } from "@/components/shared/AccountDisplay";
import { EntityToResourceImage } from "@/util/image";

export const ShardAsteroidHover: React.FC<{ entity: Entity }> = ({ entity }) => {
  const { loading } = useSyncStatus(hashEntities(Keys.SELECTED, entity));
  const { tables } = useCore();
  const name = entityToRockName(entity);

  const shardData = useShardAsteroid(entity);
  const position = tables.Position.use(entity) ?? { x: 0, y: 0 };
  const ownedBy = tables.OwnedBy.use(entity)?.value as Entity | undefined;

  const encryptionImg = EntityToResourceImage[EntityType.Encryption] ?? "";
  const { resourceCount: encryption, resourceStorage: maxEncryption } = useResourceCount(
    EntityType.Encryption,
    entity,
    loading,
  );
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
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[2rem_1fr_4rem] gap-2 items-center">
        <img src={InterfaceIcons.Shard} className={`pixel-images w-full`} />
        <div className="flex flex-col text-sm font-bold uppercase">
          <div className="flex gap-1">
            <p className="text-sm font-bold uppercase max-w-44">{name}</p>
          </div>
          <div className="flex font-bold gap-1 text-xs items-center h-4 ">
            {ownedBy ? <AccountDisplay className="w-12" player={ownedBy} raw /> : "Unowned"}
            <span className="text-[0.7rem] text-warning">
              [{position.x},{position.y}]
            </span>
          </div>
        </div>
        {shardData.dripPerSec > 0n && (
          <div className="flex font-bold gap-1 text-xs items-end">
            <div className="flex flex-col justify-center items-center">
              <IconLabel imageUri={ResourceImages.Primodium} className={`pixel-images w-3 h-3`} />+
              {formatResourceCount(EntityType.Iron, shardData.dripPerSec * 60n * 60n, {
                fractionDigits: 1,
              })}
              /HR
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-1 text-xs items-center">
        <img src={encryptionImg} className="w-4 h-4" alt="encryption" />
        <CapacityBar current={encryption} max={maxEncryption} segments={14} className="w-full" />
        <p>{formatResourceCount(EntityType.Encryption, encryption, { short: true })}</p>
      </div>
      <div className="flex bg-error text-primary font-bold text-white text-sm justify-center items-center">
        <p className="opacity-75">
          EXPLOSION
          {shardData.canExplode ? " IMMINENT" : ` IN ${formatTimeShort(shardData.timeUntilExplode)}`}
        </p>
      </div>
    </div>
  );
};
