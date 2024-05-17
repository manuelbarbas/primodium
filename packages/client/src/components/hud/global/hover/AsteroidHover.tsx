import { CapacityBar } from "@/components/core/CapacityBar";
import { SecondaryCard } from "@/components/core/Card";
import { useGame } from "@/hooks/useGame";
import { cn } from "@/util/client";
import { EntityToResourceImage, EntityToUnitImage } from "@/util/mappings";
import { Entity } from "@latticexyz/recs";
import { InterfaceIcons, ResourceImages } from "@primodiumxyz/assets";
import { IconLabel } from "src/components/core/IconLabel";
import { Loader } from "src/components/core/Loader";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { useClaimPrimodium } from "src/hooks/primodium/useClaimPrimodium";
import { useAsteroidStrength } from "src/hooks/useAsteroidStrength";
import { useFullResourceCount, useFullResourceCounts } from "src/hooks/useFullResourceCount";
import { useInGracePeriod } from "src/hooks/useInGracePeriod";
import { useSyncStatus } from "src/hooks/useSyncStatus";
import { components } from "src/network/components";
import { getAsteroidDescription, getAsteroidImage } from "src/util/asteroid";
import { EntityType, Keys, ResourceStorages } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { entityToRockName } from "src/util/name";
import { formatNumber, formatResourceCount, formatTime, formatTimeShort } from "src/util/number";

export const AsteroidHover: React.FC<{ entity: Entity; hideResources?: boolean }> = ({
  entity,
  hideResources = false,
}) => {
  const { loading } = useSyncStatus(hashEntities(Keys.SELECTED, entity));
  const name = entityToRockName(entity);
  const wormhole = components.Asteroid.get(entity)?.wormhole;
  const desc = getAsteroidDescription(entity);
  const { inGracePeriod, duration } = useInGracePeriod(entity, loading);
  const { resourceCount: encryption, resourceStorage: maxEncryption } = useFullResourceCount(
    EntityType.Encryption,
    entity,
    loading
  );

  const ownedBy = components.OwnedBy.use(entity)?.value as Entity | undefined;
  const { strength, maxStrength } = useAsteroidStrength(entity, loading);
  const claimConquerTime = useClaimPrimodium(entity);

  const position = components.Position.use(entity) ?? { x: 0, y: 0 };
  const game = useGame();
  const image = getAsteroidImage(game, entity);
  if (loading)
    return (
      <div className="relative w-56 h-24 px-auto uppercase font-bold">
        <div className="flex h-full justify-center items-center gap-2">
          <Loader />
          Loading Data
        </div>
      </div>
    );
  const encryptionImg = EntityToResourceImage[EntityType.Encryption] ?? "";
  const strengthImg = EntityToResourceImage[EntityType.HP] ?? "";

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[3rem_1fr_2rem] gap-2 items-center">
        <img src={image} className={`pixel-images w-full scale-150`} />
        <div className="flex flex-col text-sm font-bold uppercase">
          <p className="flex gap-1">
            {name}
            <span className="text-[0.7rem] text-warning">
              [{position.x},{position.y}]
            </span>
          </p>
          {ownedBy && (
            <div className="flex font-bold gap-1 text-xs items-center h-4 max-w-48">
              <AccountDisplay className="w-12" player={ownedBy} raw />
            </div>
          )}
          <div className="flex gap-1 font-bold text-xs opacity-75">
            <p>{desc.size}</p>
            <p
              className={cn(
                "px-1 ",
                wormhole ? "rainbow-bg text-neutral" : "border border-y-0 border-x-1 border-x-white"
              )}
            >
              {desc.type}
            </p>
            <SecondaryCard className="flex flex-row gap-1 p-1 text-xs items-center h-4 p-1">
              <img src={ResourceImages.Primodium} className={`pixel-images w-4 h-4`} />
              {formatNumber(desc.primodium, { short: true, showZero: true })}
            </SecondaryCard>
          </div>
        </div>
        {!ownedBy && <img src={EntityToUnitImage[EntityType.Droid]} className="w-6 h-6" />}
        {inGracePeriod && (
          <div className="flex flex-col font-bold gap-1 text-xs items-center">
            <IconLabel imageUri={InterfaceIcons.Grace} className={`pixel-images w-3 h-3`} />
            {formatTimeShort(duration)}
          </div>
        )}
      </div>

      {desc.primodium > 0n && !!claimConquerTime && (
        <div className="flex victory-bg uppercase text-primary font-bold border border-secondary/50 text-sm justify-center items-center">
          CLAIM
          {!claimConquerTime.canConquer
            ? ` IN ${formatTime(claimConquerTime.timeUntilClaim)}`
            : ` ${claimConquerTime.points} PTS`}
        </div>
      )}
      <SecondaryCard className="grid grid-cols-2 gap-2">
        <div className="flex gap-1 text-xs items-center">
          <img src={encryptionImg} className="w-4 h-4" alt="encryption" />
          <CapacityBar current={encryption} max={maxEncryption} segments={7} className="w-full" />
          <p>{formatResourceCount(EntityType.Encryption, encryption, { short: true })}</p>
        </div>
        <div className="flex gap-1 text-xs items-center">
          <img src={strengthImg} className="w-4 h-4" alt="strength" />
          <CapacityBar current={strength} max={maxStrength} segments={7} className="w-full" />
          <p>{formatResourceCount(EntityType.Defense, strength, { short: true })}</p>
        </div>
      </SecondaryCard>

      {!hideResources && <AsteroidResources entity={entity} />}
    </div>
  );
};

const ResourceDisplay = ({ type, count }: { type: Entity; count: bigint }) => {
  if (count == 0n) return null;
  return (
    <IconLabel
      key={`show-resource-${type}`}
      imageUri={EntityToResourceImage[type]}
      text={formatResourceCount(type, count, { short: true })}
    />
  );
};

const UnitDisplay = ({ type, count }: { type: Entity; count: bigint }) => {
  if (count == 0n) return null;
  return (
    <IconLabel
      key={`show-unit-${type}`}
      imageUri={EntityToUnitImage[type]}
      text={formatResourceCount(type, count, { short: true })}
    />
  );
};

// exluding units for now
const AsteroidResources = ({ entity }: { entity: Entity }) => {
  const resources = useFullResourceCounts(entity);
  const units = components.Hangar.use(entity);
  const hasUnits = !!units && units.counts.some((unit) => unit > 0n);
  const noResources = [...ResourceStorages].every((type) => resources.get(type)?.resourceCount === 0n);
  if (noResources && !hasUnits) return null;
  return (
    <SecondaryCard className="text-xs grid grid-cols-3 gap-1 place-items-center">
      {!noResources &&
        [...ResourceStorages].map((type) => (
          <ResourceDisplay key={`type-${type}`} type={type} count={resources.get(type)?.resourceCount ?? 0n} />
        ))}
      {!noResources && hasUnits && <hr className="col-span-3 w-full border-secondary/50 border-0.5 my-1" />}
      {hasUnits &&
        units?.units.map((unit, i) => <UnitDisplay key={`unit-${unit}`} type={unit} count={units?.counts[i] ?? 0n} />)}
    </SecondaryCard>
  );
};
