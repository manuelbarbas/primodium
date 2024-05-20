import { HUD } from "@/components/core/HUD";
import { usePersistentStore } from "@game/stores/PersistentStore";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { components } from "@/network/components";
import { Keys, Mode } from "@/util/constants";
import { CommandViewSelector } from "@/components/hud/command/CommandViewSelector";
import { Tabs } from "@/components/core/Tabs";
import { Overview } from "@/components/hud/command/overview";
import { BattleMenuPopup } from "@/components/hud/command/markers/BattleMenuPopup";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";
import Transfer from "@/components/hud/command/transfer/Transfer";
import { TransferContextProvider } from "@/hooks/providers/TransferProvider";
import { useMud } from "@/hooks";
import { UnitUpgrades } from "@/components/hud/asteroid/building-menu/screens/UnitUpgrades";

export const CommandCenterHUD = memo(() => {
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));
  const inCommandMode = components.SelectedMode.use()?.value === Mode.CommandCenter;
  const selectedRock = components.SelectedRock.use()?.value;
  const playerEntity = useMud().playerAccount.entity;
  const initialLeft = components.OwnedBy.use(selectedRock)?.value === playerEntity ? selectedRock : undefined;

  if (!inCommandMode) return null;

  return (
    <HUD scale={uiScale}>
      <LoadingOverlay
        syncId={Keys.SECONDARY}
        loadingMessage="Loading Fleets"
        errorMessage="Error syncing fleets data. Please refresh the page."
      >
        <Tabs className="pointer-events-auto">
          <BattleMenuPopup />

          <HUD.Center className="h-3/4 flex flex-col items-center justify-between">
            <CommandViewSelector />

            <div>
              <Tabs.Pane index={0} fragment>
                <Overview />
              </Tabs.Pane>
              <Tabs.Pane index={1} fragment>
                <TransferContextProvider initialLeft={initialLeft}>
                  <Transfer />
                </TransferContextProvider>
              </Tabs.Pane>
              <Tabs.Pane index={2} fragment>
                <UnitUpgrades />
              </Tabs.Pane>
            </div>
          </HUD.Center>
        </Tabs>
      </LoadingOverlay>
    </HUD>
  );
});
