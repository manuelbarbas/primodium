import { Entity } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { createCameraApi } from "@game/api/camera";
import { createInputApi } from "@game/api/input";
import { components } from "src/network/components";
import { world } from "@/network/world";

export const setupKeybinds = (scene: Scene) => {
  const { pan } = createCameraApi(scene);
  const { addListener } = createInputApi(scene);

  const mainbaseKeybind = addListener("Base", () => {
    //TODO - fix converting to entity
    const selectedRockEntity = components.SelectedRock.get()?.value;
    if (!selectedRockEntity) return;
    const mainBase = components.Home.get(selectedRockEntity) as Entity | undefined;

    if (!mainBase) return;

    const mainBaseCoord = components.Position.get(mainBase);
    if (mainBaseCoord) pan(mainBaseCoord);
  });

  const escapeKeybind = addListener("Esc", () => {
    // todo: dont run this if a modal is open
    if (components.SelectedBuilding.get()) {
      components.SelectedBuilding.remove();
      components.SelectedAction.remove();
    }

    if (components.SelectedRock.get()) components.SelectedRock.remove();
  });

  world.registerDisposer(() => {
    mainbaseKeybind.dispose();
    escapeKeybind.dispose();
  }, "game");
};
