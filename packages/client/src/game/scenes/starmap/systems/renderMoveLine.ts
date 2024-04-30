import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { toast } from "react-toastify";
import { createCameraApi } from "src/game/api/camera";
import { createObjectApi } from "src/game/api/objects";
import { starmapSceneConfig } from "src/game/lib/config/starmapScene";
import { TargetLine } from "src/game/lib/objects/TargetLine";
import { components } from "src/network/components";
import { sendFleetPosition } from "src/network/setup/contractCalls/fleetSend";
import { MUD } from "src/network/types";
import { world } from "src/network/world";

export const renderMoveLine = (scene: Scene, mud: MUD) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const { zoomTo } = createCameraApi(scene);
  const objects = createObjectApi(scene);

  let targetLine: TargetLine | undefined;
  function render(originEntity: Entity) {
    const isFleet = components.IsFleet.get(originEntity)?.value;

    if (!isFleet) return;
    const fleet = objects.getFleet(originEntity);

    if (!fleet) return;

    targetLine = new TargetLine(scene, fleet.getPixelCoord()).spawn();

    zoomTo(starmapSceneConfig.camera.minZoom, 500);
  }

  defineComponentSystem(
    systemsWorld,
    components.Send,
    async ({ value }) => {
      const send = value[0];
      if (!send || !send.originFleet) {
        targetLine?.dispose();
        targetLine = undefined;
        if (value[1]?.originFleet) zoomTo(1);
        return;
      }
      if (send.destination) {
        targetLine?.dispose();
        targetLine = undefined;
        components.Send.reset();
        components.SelectedFleet.clear();
        components.SelectedRock.clear();
        const destinationPosition = components.Position.get(send.destination);
        if (!destinationPosition) return toast.error("Invalid destination");
        await sendFleetPosition(mud, send.originFleet, destinationPosition);
        return;
      }

      render(send.originFleet as Entity);
    },
    {
      runOnInit: false,
    }
  );
};
