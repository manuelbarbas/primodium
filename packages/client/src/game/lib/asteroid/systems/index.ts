import { Scene } from "engine/types";
import { renderBuildingPlacementTool } from "./renderBuildingPlacementTool";
import { renderBuilding } from "./renderBuilding";
import { renderHoverTile } from "./renderHoverTile";
import { renderSelectedTile } from "./renderSelectedTile";
import { focusMainbase } from "./focusMainbase";
import { renderFog } from "./renderFog";
import { Network } from "src/network/layer";
import { Account } from "src/network/components/clientComponents";

export const runSystems = (scene: Scene, network: Network) => {
  const player = Account.get()?.value!;
  //Render world entity's sprites
  renderBuilding(scene);

  // Render map utility elements, placement indicators, etc
  renderSelectedTile(scene);
  renderHoverTile(scene);
  renderBuildingPlacementTool(scene, network);
  focusMainbase(scene, player);
  renderFog(scene, player);
};
