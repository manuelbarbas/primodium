import { useContractCalls } from "@/hooks/useContractCalls";
import { useGame } from "@/hooks/useGame";
import { EntityToResourceImage } from "@/util/image";
import { ResourceType } from "@primodiumxyz/core";
import { useBuildingInfo, useBuildingName, useCore } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";
import { useMemo } from "react";
import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { Navigator } from "@/components/core/Navigator";

export const Demolish: React.FC<{ building: Entity }> = ({ building }) => {
  const { tables, utils } = useCore();
  const { demolishBuilding } = useContractCalls();

  const name = useBuildingName(building);
  const {
    production,
    position: { parentEntity },
  } = useBuildingInfo(building);

  if (!parentEntity) throw new Error("[Demolish] Building has no parentEntity");
  const blockingResource = production.find((production) => {
    if (production.type !== ResourceType.Utility) return false;
    const { resourceCount } = utils.getResourceCount(production.resource, parentEntity as Entity);
    return resourceCount < production.amount;
  });

  const scene = useGame().ASTEROID;
  const handleDemolish = () => {
    const selectedBuildingObj = scene.objects.building.get(building);
    const pendingAnim = scene.phaserScene.tweens.add({
      targets: [selectedBuildingObj],
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
    selectedBuildingObj?.setTint(0xff0000);
    demolishBuilding(building, () => {
      pendingAnim.destroy();
      selectedBuildingObj?.setAlpha(1);
      selectedBuildingObj?.clearTint();
    });
    tables.SelectedBuilding.remove();
  };

  const Content = useMemo(
    () => () =>
      !blockingResource ? (
        <p>
          Are you sure you want to demolish <br />
          <b>{name}</b>?
        </p>
      ) : (
        <div>
          You cannot demolish this building. <br />
          <IconLabel
            text=""
            hideText
            imageUri={EntityToResourceImage[blockingResource.resource]}
            className="mx-2 w-5"
          />
          will drop below zero.
        </div>
      ),
    [name, blockingResource]
  );
  return (
    <Navigator.Screen title="Demolish">
      <SecondaryCard className="space-y-3 items-center text-center w-full pt-6">
        <Content />

        <div className="flex gap-2">
          <Button disabled={!!blockingResource} className="btn-error btn-sm" onClick={handleDemolish}>
            Demolish
          </Button>
          <Navigator.BackButton className="btn-sm border-secondary" />
        </div>
      </SecondaryCard>
    </Navigator.Screen>
  );
};
