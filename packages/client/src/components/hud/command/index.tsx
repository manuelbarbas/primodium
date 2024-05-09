import { HUD } from "@/components/core/HUD";
import { usePersistentStore } from "@game/stores/PersistentStore";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { components } from "@/network/components";
import { Mode } from "@/util/constants";
import { CommandViewSelector } from "@/components/hud/command/CommandViewSelector";
import { Tabs } from "@/components/core/Tabs";
import { Overview } from "@/components/hud/command/overview";
import Transfer from "@/components/hud/command/transfer/Transfer";

export const CommandCenterHUD = memo(() => {
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));
  const inCommandMode = components.SelectedMode.use()?.value === Mode.CommandCenter;

  if (!inCommandMode) return null;

  return (
    <HUD scale={uiScale}>
      <Tabs persistIndexKey="command-center" className="pointer-events-auto">
        {/* Contains View Buttons */}
        <HUD.Left>
          <CommandViewSelector />
        </HUD.Left>

        <Tabs.Pane index={0} fragment>
          <Overview />
        </Tabs.Pane>
        <Tabs.Pane index={2} fragment>
          <HUD.Center>
            <Transfer />
          </HUD.Center>
        </Tabs.Pane>
      </Tabs>
    </HUD>
  );
});
