import { CapacityBar } from "@/components/core/CapacityBar";
import { Dropdown } from "@/components/core/Dropdown";
import { usePlayerAsteroids } from "@/react/hooks/usePlayerAsteroids";
import { EntityToResourceImage } from "@/util/mappings";
import { formatResourceCount } from "@/util/number";
import { Entity } from "@latticexyz/recs";
import { useState } from "react";
import { useMud } from "src/hooks";
import { useAsteroidStrength } from "src/hooks/useAsteroidStrength";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { entityToRockName } from "src/util/name";

export const FavoriteAsteroids = () => {
  const playerEntity = useMud().playerAccount.entity;

  const asteroids = usePlayerAsteroids(playerEntity);

  const home = components.Home.use(playerEntity)?.value as Entity;
  const [selectedAsteroid, setSelectedAsteroid] = useState<Entity | null>(asteroids.length > 0 ? asteroids[0] : null);
  if (!selectedAsteroid) return null;

  return (
    <div className="flex flex-col lg:flex-row justify-end p-6 gap-4">
      <Dropdown value={selectedAsteroid} onChange={setSelectedAsteroid} size="sm">
        {asteroids.map((asteroid) => (
          <Dropdown.Item className="flex items-center gap-1" key={`favorite-asteroid-${asteroid}`} value={asteroid}>
            {asteroid === home && (
              <img src={EntityToResourceImage[EntityType.Housing]} className="w-4 h-4" alt="home" />
            )}
            {entityToRockName(asteroid)}
          </Dropdown.Item>
        ))}
      </Dropdown>
      <SelectedFavoriteAsteroid asteroid={selectedAsteroid} />
    </div>
  );
};

const SelectedFavoriteAsteroid = ({ asteroid }: { asteroid: Entity }) => {
  const { resourceCount: encryption, resourceStorage: maxEncryption } = useFullResourceCount(
    EntityType.Encryption,
    asteroid
  );
  const { strength, maxStrength } = useAsteroidStrength(asteroid);
  const encryptionImg = EntityToResourceImage[EntityType.Encryption] ?? "";
  const strengthImg = EntityToResourceImage[EntityType.HP] ?? "";
  return (
    <div className="flex flex-col 2xl:flex-row gap-4 justify-end">
      <div className="flex gap-2 items-center">
        <img src={encryptionImg} className="w-4 h-4" alt="encryption" />
        <CapacityBar current={encryption} max={maxEncryption} segments={7} className="w-20" />
        {formatResourceCount(EntityType.Encryption, encryption, { short: true })}
      </div>
      <div className="flex gap-2 items-center">
        <img src={strengthImg} className="w-4 h-4" alt="strength" />
        <CapacityBar current={strength} max={maxStrength} segments={7} className="w-20" />
        {formatResourceCount(EntityType.Defense, strength, { short: true })}
      </div>
    </div>
  );
};
