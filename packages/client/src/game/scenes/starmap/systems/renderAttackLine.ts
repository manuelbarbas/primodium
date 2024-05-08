import { attack as callAttack } from "src/network/setup/contractCalls/attack";
import { MUD } from "src/network/types";
import { Entity, namespaceWorld, defineComponentSystem } from "@latticexyz/recs";
import { world } from "src/network/world";
import { SceneApi } from "@/game/api/scene";
import { starmapSceneConfig } from "src/game/lib/config/starmapScene";
import { components } from "src/network/components";
import { TargetLine } from "src/game/lib/objects/TargetLine";

export const renderAttackLine = (scene: SceneApi, mud: MUD) => {
  const systemsWorld = namespaceWorld(world, "systems");

  function panToDestination(entity: Entity) {
    const fleetDestinationEntity = components.FleetMovement.get(entity)?.destination as Entity;
    if (!fleetDestinationEntity) return;
    const fleetDestinationPosition = components.Position.get(fleetDestinationEntity);
    if (!fleetDestinationPosition) return;
    scene.camera.pan(fleetDestinationPosition);
  }

  let targetLine: TargetLine | undefined;
  function render(originEntity: Entity) {
    const isFleet = components.IsFleet.get(originEntity)?.value;

    if (!isFleet) return;
    const fleet = scene.objects.getFleet(originEntity);

    if (!fleet) return;

    targetLine = new TargetLine(scene, fleet.getPixelCoord(), 0xff0000).spawn();

    scene.camera.zoomTo(starmapSceneConfig.camera.maxZoom, 500);
    panToDestination(originEntity);
  }

  defineComponentSystem(
    systemsWorld,
    components.Attack,
    async ({ value }) => {
      const attack = value[0];
      if (!attack || !attack.originFleet) {
        targetLine?.dispose();
        targetLine = undefined;
        if (value[1]?.originFleet) scene.camera.zoomTo(1);
        return;
      }
      if (attack.destination) {
        targetLine?.dispose();
        targetLine = undefined;
        components.Attack.reset();
        components.SelectedFleet.clear();
        components.SelectedRock.clear();
        await callAttack(mud, attack.originFleet, attack.destination);
        return;
      }

      render(attack.originFleet as Entity);
    },
    {
      runOnInit: false,
    }
  );
};
