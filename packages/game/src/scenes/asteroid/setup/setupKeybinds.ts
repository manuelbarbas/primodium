import { Entity } from "@latticexyz/recs";
import { components } from "@primodiumxyz/core/network/components";
import { world } from "@primodiumxyz/core/network/world";
import { Mode } from "@primodiumxyz/core/util/constants";

import { PrimodiumScene } from "@/api/scene";

export const setupKeybinds = (scene: PrimodiumScene) => {
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

    const mode = components.SelectedMode.get()?.value;
    if (mode === Mode.Starmap && components.SelectedRock.get()) components.SelectedRock.remove();
    if (mode === Mode.Spectate) components.SelectedMode.set({ value: Mode.Starmap });
  });

  world.registerDisposer(() => {
    mainbaseKeybind.dispose();
    escapeKeybind.dispose();
  }, "game");
};
