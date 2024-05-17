import { HUD } from "@/components/core/HUD";
import { usePersistentStore } from "@game/stores/PersistentStore";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { components } from "@/network/components";
import { Keys, Mode } from "@/util/constants";
import { CommandViewSelector } from "@/components/hud/command/CommandViewSelector";
import { Tabs } from "@/components/core/Tabs";
import { Overview } from "@/components/hud/command/overview";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";
import Transfer from "@/components/hud/command/transfer/Transfer";
import { TransferContextProvider } from "@/hooks/providers/TransferProvider";
import { useMud } from "@/hooks";

export const CommandCenterHUD = memo(() => {
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));
  const playerEntity = useMud().playerAccount.entity;
  const inCommandMode = components.SelectedMode.use()?.value === Mode.CommandCenter;
  const selectedRock = components.SelectedRock.use()?.value;
  const initialLeft = components.OwnedBy.use(selectedRock)?.value === playerEntity ? selectedRock : undefined;

  if (!inCommandMode) return null;

  return (
    <HUD scale={uiScale}>
      <Tabs className="pointer-events-auto">
        {/* Contains View Buttons */}
        <HUD.Left>
          <CommandViewSelector />
        </HUD.Left>

        <Tabs.Pane index={0} fragment>
          <Overview />
        </Tabs.Pane>
        <Tabs.Pane index={2} fragment>
          <HUD.Center>
            <TransferContextProvider initialLeft={initialLeft}>
              <Transfer />
            </TransferContextProvider>
          </HUD.Center>
        </Tabs.Pane>
      </Tabs>
      <LoadingOverlay
        syncId={Keys.SECONDARY}
        loadingMessage="Loading Fleets"
        errorMessage="Error syncing fleets data. Please refresh the page."
      />
    </HUD>
  );
});
