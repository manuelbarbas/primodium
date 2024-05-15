import { MUD } from "src/network/types";
import { PrimodiumScene } from "@/game/api/scene";
import { setupMoveNotifications } from "@/game/scenes/ui/systems/setupMoveNotifications";
import { setupSwapNotifications } from "@/game/scenes/ui/systems/setupSwapNotifications";
import { setupInvitations } from "./setupPlayerInvites";

export const runSystems = (scene: PrimodiumScene, mud: MUD) => {
  setupMoveNotifications(scene);
  setupInvitations(mud, scene);
  setupSwapNotifications(mud, scene);
};
