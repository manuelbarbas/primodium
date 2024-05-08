import { Entity } from "@latticexyz/recs";
import { SceneApi } from "@/game/api/scene";
import { components } from "src/network/components";
import { world } from "@/network/world";

export const setupKeybinds = (scene: SceneApi) => {
  const mainbaseKeybind = scene.input.addListener("Base", () => {
    //TODO - fix converting to entity
    const selectedRockEntity = components.SelectedRock.get()?.value;
    if (!selectedRockEntity) return;
    const mainBase = components.Home.get(selectedRockEntity) as Entity | undefined;

    if (!mainBase) return;

    const mainBaseCoord = components.Position.get(mainBase);
    if (mainBaseCoord) scene.camera.pan(mainBaseCoord);
  });

  const escapeKeybind = scene.input.addListener("Esc", () => {
    // todo: dont run this if a modal is open
    if (components.SelectedBuilding.get()) {
      components.SelectedBuilding.remove();
      components.SelectedAction.remove();
    }

    if (components.Send.get() || components.Attack.get()) {
      components.Send.reset();
      components.Attack.reset();
    } else if (components.SelectedFleet.get()) components.SelectedFleet.remove();

    if (components.SelectedRock.get()) components.SelectedRock.remove();
  });

  world.registerDisposer(() => {
    mainbaseKeybind.dispose();
    escapeKeybind.dispose();
  }, "game");
};
