import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { Badge } from "src/components/core/Badge";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { components } from "src/network/components";
import { Account } from "src/network/components/clientComponents";
import { getBlockTypeName } from "src/util/common";
import { EntityType, RESOURCE_SCALE, ResourceImage, ResourceType } from "src/util/constants";
import { getRecipe } from "src/util/resource";
import { Hex } from "viem";
import { UpgradeMiningVessel } from "../widgets/UpgradeMiningVessel";
import { VesselSlots } from "../widgets/VesselSlots";

export const CommissionCost: React.FC<{ player: Entity }> = ({ player }) => {
  const recipe = useMemo(() => {
    const level = components.UnitLevel.getWithKeys(
      { entity: player as Hex, unit: EntityType.MiningVessel as Hex },
      { value: 0n }
    ).value;

    return getRecipe(EntityType.MiningVessel, level);
  }, [player]);

  return (
    <SecondaryCard className="w-full">
      <p className="text-xs opacity-75 px-2 mb-1">COMMISSION COST</p>
      <div className="flex flex-wrap gap-1 px-2">
        {recipe.length !== 0 &&
          recipe.map((resource) => {
            if (resource.type === ResourceType.Utility) return;

            return (
              <Badge key={resource.id + resource.type} className="text-xs gap-2">
                <ResourceIconTooltip
                  playerEntity={player}
                  name={getBlockTypeName(resource.id)}
                  image={ResourceImage.get(resource.id) ?? ""}
                  resource={resource.id}
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

export const MiningVessels: React.FC<{ building: Entity }> = ({ building }) => {
  const player = Account.use(undefined, {
    value: singletonEntity,
  }).value;
  const mainBaseLvlReq =
    components.P_RequiredBaseLevel.getWithKeys({ level: 0n, prototype: EntityType.MiningVessel as Hex })?.value ?? 1n;
  const mainBase = components.Home.use(player)?.mainBase;
  if (!mainBase) return null;
  const mainBaseLvl = components.Level.useWithKeys({ entity: mainBase as Hex }, { value: 0n }).value;

  return (
    <Navigator.Screen title="MiningVessels" className="w-full">
      <SecondaryCard className="flex-row gap-1">
        <FaInfoCircle />
        <div className="text-xs italic opacity-75 space-y-2">
          {mainBaseLvl < mainBaseLvlReq && (
            <p className="font-bold text-sm text-red-400">
              Mining vessels available at Main Base Lvl. {mainBaseLvlReq.toString()}
            </p>
          )}
          <p>Mining vessels are used to mine motherlodes. To unlock more vessel slots, upgrade your main base.</p>
        </div>
      </SecondaryCard>
      {mainBaseLvl >= mainBaseLvlReq && (
        <>
          <VesselSlots building={building} player={player} />
          <CommissionCost player={player} />
          <UpgradeMiningVessel />
        </>
      )}

      <Navigator.BackButton className="mt-1" />
    </Navigator.Screen>
  );
};
