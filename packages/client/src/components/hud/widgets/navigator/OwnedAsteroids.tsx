import { EntityToResourceImage } from "@/util/mappings";
import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { useMud } from "src/hooks";
import { useAsteroidStrength } from "src/hooks/useAsteroidStrength";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { getAsteroidImage, getAsteroidInfo } from "src/util/asteroid";
import { EntityType } from "src/util/constants";
import { entityToRockName } from "src/util/name";
import { formatResourceCount } from "src/util/number";

export const LabeledValue: React.FC<{
  label: string;
  children?: React.ReactNode;
}> = ({ children = null, label }) => {
  return (
    <div className="flex flex-col gap-1 w-fit">
      <p className="text-xs font-bold text-accent">{label}</p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
};

export const OwnedAsteroid: React.FC<{ className?: string; asteroid: Entity; onClick?: () => void }> = ({
  className,
  asteroid,
  onClick,
}) => {
  const primodium = usePrimodium();
  const imageUri = getAsteroidImage(primodium, asteroid);
  const selected = components.SelectedRock.use()?.value === asteroid;
  const { resourceCount: encryption, resourceStorage: maxEncryption } = useFullResourceCount(
    EntityType.Encryption,
    asteroid
  );
  const { strength, maxStrength } = useAsteroidStrength(asteroid);

  const getColor = (value: bigint, max: bigint) => {
    if (max === 0n) return "";
    const pct = (value * 100n) / max;
    if (pct > 66) return "text-success";
    if (pct > 33) return "text-warning";
    return "text-error";
  };
  return (
    <Button size="content" selected={selected} className={className} onClick={onClick}>
      <img src={imageUri} className=" w-10 h-10" />
      <div className="flex flex-col items-center gap-1">
        <p className="font-bold text-sm">{entityToRockName(asteroid)}</p>
        <div className="grid grid-cols-5 gap-1 text-xs">
          <img src={EntityToResourceImage[EntityType.Encryption]} className="w-4 h-4" />
          <p className="col-span-4">
            <span className={getColor(encryption, maxEncryption)}>
              {formatResourceCount(EntityType.Encryption, encryption, { short: true }).toString()}
            </span>
            /{formatResourceCount(EntityType.Encryption, maxEncryption, { short: true }).toString()}
          </p>
          <img src={EntityToResourceImage[EntityType.HP]} className="w-4 h-4 col-span-1" />
          <p className="col-span-4">
            <span className={getColor(encryption, maxEncryption)}>
              {formatResourceCount(EntityType.HP, strength, { short: true }).toString()}
            </span>
            /{formatResourceCount(EntityType.HP, maxStrength, { short: true }).toString()}
          </p>
        </div>
      </div>
    </Button>
  );
};

export const OwnedAsteroids: React.FC<{ className?: string }> = ({ className }) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();

  const primodium = usePrimodium();
  const query = [HasValue(components.OwnedBy, { value: playerEntity }), Has(components.Asteroid)];
  const asteroids = useEntityQuery(query);

  const handleSelectRock = (entity: Entity) => {
    console.log("clicking");
    const { position } = getAsteroidInfo(primodium, entity);
    const { pan, zoomTo } = primodium.api("STARMAP").camera;

    components.SelectedRock.set({ value: entity });

    pan({
      x: position.x,
      y: position.y,
    });

    zoomTo(2);
  };

  return (
    <SecondaryCard className={className}>
      {asteroids.length === 0 && <p className="opacity-50 uppercase">you control no asteroids</p>}
      <div className="grid grid-cols-2 gap-1">
        {asteroids.map((entity) => {
          return <OwnedAsteroid key={entity} asteroid={entity} onClick={() => handleSelectRock(entity)} />;
        })}
      </div>
    </SecondaryCard>
  );
};
