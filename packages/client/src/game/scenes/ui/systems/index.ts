import { MUD } from "src/network/types";
import { PrimodiumScene } from "@/game/api/scene";
import { setupMoveNotifications } from "@/game/scenes/ui/systems/setupMoveNotifications";
import { setupSwapNotifications } from "@/game/scenes/ui/systems/setupSwapNotifications";
import { setupInvitations } from "@/game/scenes/ui/systems/setupPlayerInvites";
import { setupPlayerAllianceInfo } from "@/game/scenes/ui/systems/setupPlayerAllianceInfo";

export const runSystems = (scene: PrimodiumScene, mud: MUD) => {
  setupMoveNotifications(scene);
  setupSwapNotifications(mud, scene);
  setupInvitations(mud, scene);
  setupPlayerAllianceInfo();
};
