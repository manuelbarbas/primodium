import { Navigator } from "src/components/core/Navigator";
import { SingletonID } from "@latticexyz/network";
import { Account } from "src/network/components/clientComponents";
import { EntityID } from "@latticexyz/recs";
import {
  BlockType,
  RESOURCE_SCALE,
  ResourceImage,
  ResourceType,
} from "src/util/constants";
import { Badge } from "src/components/core/Badge";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { getBlockTypeName } from "src/util/common";
import { SecondaryCard } from "src/components/core/Card";
import { useMemo } from "react";
import { hashKeyEntity } from "src/util/encode";
import { Level } from "src/network/components/chainComponents";
import { getRecipe } from "src/util/resource";
import { UpgradeMiningVessel } from "../widgets/UpgradeMiningVessel";
import { FaInfoCircle } from "react-icons/fa";
import { VesselSlots } from "../widgets/VesselSlots";

export const CommissionCost: React.FC<{ player: EntityID }> = ({ player }) => {
  const recipe = useMemo(() => {
    const playerUnitEntity = hashKeyEntity(BlockType.MiningVessel, player);
    const level = Level.get(playerUnitEntity, { value: 0 }).value;
    const unitEntity = hashKeyEntity(BlockType.MiningVessel, level);

    return getRecipe(unitEntity);
  }, [player]);

  return (
    <SecondaryCard className="w-full">
      <p className="text-xs opacity-75 px-2 mb-1">COMMISSION COST</p>
      <div className="flex flex-wrap gap-1 px-2">
        {recipe.length !== 0 &&
          recipe.map((resource) => {
            if (resource.type === ResourceType.Utility) return;

            return (
              <Badge
                key={resource.id + resource.type}
                className="text-xs gap-2"
              >
                <ResourceIconTooltip
                  name={getBlockTypeName(resource.id)}
                  image={ResourceImage.get(resource.id) ?? ""}
                  resourceId={resource.id}
                  amount={resource.amount}
                  resourceType={resource.type}
                  scale={RESOURCE_SCALE}
                  direction="top"
                  validate
                />
              </Badge>
            );
          })}
      </div>
    </SecondaryCard>
  );
};

export const MiningVessels: React.FC<{ building: EntityID }> = ({
  building,
}) => {
  const player = Account.use(undefined, {
    value: SingletonID,
  }).value;

  return (
    <Navigator.Screen title="MiningVessels" className="w-full">
      <SecondaryCard className="flex-row gap-1">
        <FaInfoCircle />
        <div className="text-xs italic opacity-75 space-y-2">
          <p>
            Mining vessels are used to mine motherlodes. To commission one, you
            must unlock an available slot first.
          </p>
          <p className="font-bold">First slot available at Main Base Lvl. 4</p>
        </div>
      </SecondaryCard>
      <VesselSlots building={building} player={player} />
      <CommissionCost player={player} />
      <UpgradeMiningVessel />

      <Navigator.BackButton className="mt-1" />
    </Navigator.Screen>
  );
};
