import { Button } from "@/components/core/Button";
import { CapacityBar } from "@/components/core/CapacityBar";
import { HUD } from "@/components/core/HUD";
import { Tabs } from "@/components/core/Tabs";
import { useAsteroidStrength } from "@/hooks/useAsteroidStrength";
import { useFullResourceCount } from "@/hooks/useFullResourceCount";
import { components } from "@/network/components";
import { EntityType } from "@/util/constants";
import { EntityToResourceImage } from "@/util/mappings";
import { formatResourceCount } from "@/util/number";
import { Entity } from "@latticexyz/recs";

const AsteroidStats = ({ asteroid }: { asteroid: Entity }) => {
  const { resourceCount: encryption, resourceStorage: maxEncryption } = useFullResourceCount(
    EntityType.Encryption,
    asteroid
  );
  const { strength, maxStrength } = useAsteroidStrength(asteroid);
  const encryptionImg = EntityToResourceImage[EntityType.Encryption] ?? "";
  const strengthImg = EntityToResourceImage[EntityType.HP] ?? "";
  return (
    <div className="flex flex-row gap-4 justify-end">
      <div className="flex gap-2 items-center">
        <img src={encryptionImg} className="w-4 h-4" alt="encryption" />
        <CapacityBar current={encryption} max={maxEncryption} segments={10} className="w-24" />
        {formatResourceCount(EntityType.Encryption, encryption, { short: true })}
      </div>
      <div className="flex gap-2 items-center">
        <img src={strengthImg} className="w-4 h-4" alt="strength" />
        <CapacityBar current={strength} max={maxStrength} segments={10} className="w-24" />
        {formatResourceCount(EntityType.Defense, strength, { short: true })}
      </div>
    </div>
  );
};

const ActionButtons = () => {
  return (
    <div className="flex gap-2">
      <Tabs.Button index={1} variant="secondary" size="sm">
        + CREATE FLEET
      </Tabs.Button>
      <Button variant="error" size="sm">
        ABANDON
      </Button>
    </div>
  );
};

export const AsteroidStatsAndActions = () => {
  const playerEntity = components.Account.use()?.value;
  const selectedAsteroid = components.SelectedRock.use()?.value;
  const homeAsteroid = components.Home.use(playerEntity)?.value;

  if (!selectedAsteroid && !homeAsteroid) return null;

  return (
    <HUD.BottomMiddle className="mb-36 flex flex-col items-center gap-4">
      <AsteroidStats asteroid={(selectedAsteroid ?? homeAsteroid) as Entity} />
      <ActionButtons />
    </HUD.BottomMiddle>
  );
};
