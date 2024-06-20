import { HUD } from "@/components/core/HUD";
import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";
import { memo, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { CommandViewSelector } from "@/components/hud/command/CommandViewSelector";
import { Tabs } from "@/components/core/Tabs";
import { Overview } from "@/components/hud/command/overview";
import { BattleMenuPopup } from "@/components/hud/command/markers/BattleMenuPopup";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";
import Transfer from "@/components/hud/command/transfer/Transfer";
import { TransferContextProvider } from "@/hooks/providers/TransferProvider";
import { UnitUpgrades } from "@/components/hud/asteroid/building-menu/screens/UnitUpgrades";
import { Entity } from "@primodiumxyz/reactive-tables";
import { useAccountClient, useCore } from "@primodiumxyz/core/react";
import { Keys, Mode } from "@primodiumxyz/core";

export const CommandCenterHUD = memo(() => {
  const { tables } = useCore();
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));
  const inCommandMode = tables.SelectedMode.use()?.value === Mode.CommandCenter;
  const selectedRock = tables.SelectedRock.use()?.value;
  const playerEntity = useAccountClient().playerAccount.entity;
  const firstInitialLeft = tables.OwnedBy.use(selectedRock)?.value === playerEntity ? selectedRock : undefined;
  const [initialLeft, setInitialLeft] = useState<Entity>();
  const [initialRight, setInitialRight] = useState<"newFleet">();

  useEffect(() => {
    setInitialLeft(firstInitialLeft);
  }, [firstInitialLeft]);

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

          <HUD.Center className="h-3/4 flex flex-col items-center justify-between pointer-events-none">
            <CommandViewSelector setInitialRight={() => setInitialRight(undefined)} />

            <div>
              <Tabs.Pane index={0} fragment>
                <Overview onClickCreateFleet={() => setInitialRight("newFleet")} />
              </Tabs.Pane>
              <Tabs.Pane index={1} fragment>
                <TransferContextProvider initialLeft={initialLeft} initialRight={initialRight}>
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
