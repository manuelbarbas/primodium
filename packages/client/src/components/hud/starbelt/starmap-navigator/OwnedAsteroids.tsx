import { entityToRockName, EntityType, formatResourceCount } from "@primodiumxyz/core";
import { useAccountClient, useAsteroidStrength, useCore, useResourceCount } from "@primodiumxyz/core/react";
import { Entity, useQuery } from "@primodiumxyz/reactive-tables";
import { Badge } from "@/components/core/Badge";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { useAsteroidImage } from "@/hooks/image/useAsteroidImage";
import { useGame } from "@/hooks/useGame";
import { EntityToResourceImage } from "@/util/image";

export const OwnedAsteroid: React.FC<{ className?: string; asteroid: Entity; onClick?: () => void }> = ({
  className,
  asteroid,
  onClick,
}) => {
  const { tables } = useCore();
  const imageUri = useAsteroidImage(asteroid);
  const selected = tables.SelectedRock.use()?.value === asteroid;
  const { resourceCount: encryption, resourceStorage: maxEncryption } = useResourceCount(
    EntityType.Encryption,
    asteroid,
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
  } = useAccountClient();
  const { tables, utils } = useCore();
  const game = useGame();

  const asteroids = useQuery({
    with: [tables.Asteroid],
    withProperties: [{ table: tables.OwnedBy, properties: { value: playerEntity } }],
  });

  const handleSelectRock = (entity: Entity) => {
    const { position } = utils.getAsteroidInfo(entity);
    const { pan, zoomTo } = game.STARMAP.camera;

    tables.SelectedRock.set({ value: entity });

    pan({
      x: position.x,
      y: position.y,
    });

    zoomTo(2);
  };

  return (
    <Card noDecor className={`relative ${className}`}>
      {asteroids.length === 0 && (
        <p className="w-full h-full text-xs grid place-items-center opacity-50 uppercase">you control no asteroids</p>
      )}
      <div className="grid grid-cols-2 gap-1 mb-4 h-full auto-rows-max overflow-auto hide-scrollbar">
        {asteroids.map((entity) => {
          return <OwnedAsteroid key={entity} asteroid={entity} onClick={() => handleSelectRock(entity)} />;
        })}
      </div>
      {asteroids.length > 0 && (
        <Badge variant="info" className="absolute bottom-3 right-3 text-sm">
          {asteroids.length} asteroid{asteroids.length > 1 ? "s" : ""}
        </Badge>
      )}
    </Card>
  );
};
