import { HUD } from "@/components/core/HUD";
import { usePersistentStore } from "@game/stores/PersistentStore";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { components } from "@/network/components";
import { Mode } from "@/util/constants";
import { CommandViewSelector } from "@/components/hud/command/CommandViewSelector";

export const CommandCenterHUD = memo(() => {
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));
  const inCommandMode = components.SelectedMode.use()?.value === Mode.CommandCenter;

  if (!inCommandMode) return null;

  return (
    <HUD scale={uiScale}>
      <HUD.Left>
        <CommandViewSelector />
      </HUD.Left>
    </HUD>
  );
});
