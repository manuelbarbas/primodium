// import { setupMoveNotifications } from "@game/scenes/ui/systems/setupMoveNotifications";
import { Core } from "@primodiumxyz/core";
import { setupBattleNotifications } from "@game/scenes/ui/systems/setupBattleNotifications";
import { setupMoveNotifications } from "@game/scenes/ui/systems/setupMoveNotifications";
import { setupPlayerInvites } from "@game/scenes/ui/systems/setupPlayerInvites";
import { setupSwapNotifications } from "@game/scenes/ui/systems/setupSwapNotifications";
import { PrimodiumScene } from "@game/types";

export const runSystems = (scene: PrimodiumScene, core: Core) => {
  setupMoveNotifications(scene, core);
  setupPlayerInvites(scene, core);
  setupSwapNotifications(scene, core);
  setupBattleNotifications(scene, core);
};
