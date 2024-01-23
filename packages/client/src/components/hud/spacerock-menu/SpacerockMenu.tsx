import { components } from "src/network/components";

import { KeyNames, KeybindActions, Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { Tabs } from "src/components/core/Tabs";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { usePrimodium } from "src/hooks/usePrimodium";
import { GracePeriod } from "../GracePeriod";
import { TargetHeader } from "./TargetHeader";
import { Resources } from "./widgets/resources/Resources";
import { hashEntities } from "src/util/encode";
import { Keys } from "src/util/constants";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Loader } from "src/components/core/Loader";
import { SecondaryCard } from "src/components/core/Card";
import { useSyncStatus } from "src/hooks/useSyncStatus";
import { FaEye, FaTimes } from "react-icons/fa";
import { Button } from "src/components/core/Button";

export const SpacerockMenu: React.FC = () => {
  const selectedSpacerock = components.SelectedRock.use()?.value ?? singletonEntity;
  const { loading, error } = useSyncStatus(hashEntities(Keys.SELECTED, selectedSpacerock));
  const ownedBy = components.OwnedBy.use(selectedSpacerock)?.value;
  const primodium = usePrimodium();
  const {
    hooks: { useKeybinds },
    scene: { transitionToScene },
  } = primodium.api()!;
  const keybinds = useKeybinds();

  if (!selectedSpacerock) return null;

  return (
    <div className="w-screen px-2 flex justify-center">
      <Tabs className="min-w-fit w-[50rem] flex flex-col items-center gap-0 relative">
        <Tabs.Button
          index={0}
          togglable
          keybind={KeybindActions.SpacerockMenu}
          onClick={() => {
            components.SelectedBuilding.remove();
            components.SelectedAction.remove();
          }}
          className="rounded-b-none border-b-0 btn-md border-secondary relative py-2 hover:text-accent group w-fit"
        >
          <TargetHeader hideStats />
          <div className="absolute kbd kbd-xs top-0 right-0 translate-x-1/2 -translate-y-1/2">
            {KeyNames[keybinds[KeybindActions.SpacerockMenu]?.entries().next().value[0]] ??
              keybinds[KeybindActions.SpacerockMenu]?.entries().next().value[0]}
          </div>
        </Tabs.Button>
        {!loading && !error && (
          <Tabs.Pane index={0} className="w-full border-b-0 rounded-x-none rounded-b-none relative">
            <Resources />

            {ownedBy && (
              <>
                <Button
                  className="btn-sm absolute right-6 -top-1 border border-secondary flex"
                  onClick={async () => {
                    components.ActiveRock.set({ value: selectedSpacerock as Entity });
                    await transitionToScene(Scenes.Starmap, Scenes.Asteroid, 0);
                    components.MapOpen.set({ value: false });
                  }}
                >
                  <FaEye className="text-success" />
                  <AccountDisplay player={ownedBy as Entity} className=" text-xs" />
                </Button>

                <GracePeriod
                  player={ownedBy as Entity}
                  className="absolute left-6 -top-1 border border-secondary text-xs p-2 bg-base-100 rounded-box rounded-t-none"
                />
              </>
            )}
          </Tabs.Pane>
        )}
        {loading && (
          <Tabs.Pane index={0} className="w-full border-b-0 rounded-x-none rounded-b-none relative ">
            <SecondaryCard className="uppercase font-bold w-full items-center py-10">
              <Loader className="opacity-75 p-3" />
              Fetching Asteroid Info
            </SecondaryCard>
          </Tabs.Pane>
        )}
        {!loading && error && (
          <Tabs.Pane index={0} className="w-full border-b-0 rounded-x-none rounded-b-none relative ">
            <SecondaryCard className="uppercase font-bold w-full items-center py-10 text-error">
              <FaTimes />
              Error Fetching Asteroid Info
            </SecondaryCard>
          </Tabs.Pane>
        )}
      </Tabs>
    </div>
  );
};
