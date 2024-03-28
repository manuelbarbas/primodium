import { attack as callAttack } from "src/network/setup/contractCalls/attack";
import { MUD } from "src/network/types";
import { Entity, namespaceWorld, defineComponentSystem } from "@latticexyz/recs";
import { world } from "src/network/world";
import { createCameraApi } from "src/game/api/camera";
import { Scene } from "engine/types";
import { starmapSceneConfig } from "src/game/lib/config/starmapScene";
import { components } from "src/network/components";
import { TargetLine } from "src/game/lib/objects/TargetLine";
import { createObjectApi } from "src/game/api/objects";

export const renderAttackLine = (scene: Scene, mud: MUD) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const { pan, zoomTo } = createCameraApi(scene);
  const objects = createObjectApi(scene);

  function panToDestination(entity: Entity) {
    const fleetDestinationEntity = components.FleetMovement.get(entity)?.destination as Entity;
    if (!fleetDestinationEntity) return;
    const fleetDestinationPosition = components.Position.get(fleetDestinationEntity);
    if (!fleetDestinationPosition) return;
    pan(fleetDestinationPosition);
  }

  let targetLine: TargetLine | undefined;
  function render(originEntity: Entity) {
    const isFleet = components.IsFleet.get(originEntity)?.value;

    if (!isFleet) return;
    const fleet = objects.getFleet(originEntity);

    if (!fleet) return;

    targetLine = new TargetLine(scene, fleet.getPixelCoord(), 0xff0000).spawn();

    zoomTo(starmapSceneConfig.camera.maxZoom, 500);
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
        if (value[1]?.originFleet) zoomTo(1);
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
