import { components } from "src/network/components";

import { KeyNames, KeybindActions } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { ERock } from "contracts/config/enums";
import { Tabs } from "src/components/core/Tabs";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { usePrimodium } from "src/hooks/usePrimodium";
import { GracePeriod } from "../GracePeriod";
import { TargetHeader } from "./TargetHeader";
import { Resources } from "./widgets/resources/Resources";

export const SpacerockMenu: React.FC = () => {
  const selectedSpacerock = components.SelectedRock.use()?.value;
  const rockType = components.RockType.use(selectedSpacerock)?.value;
  const ownedBy = components.OwnedBy.use(selectedSpacerock)?.value;
  const primodium = usePrimodium();
  const {
    hooks: { useKeybinds },
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
        <Tabs.Pane index={0} className="w-full border-b-0 rounded-x-none rounded-b-none relative">
          <Resources />
          {ownedBy && (
            <AccountDisplay
              player={ownedBy as Entity}
              showSpectate
              className="absolute right-6 -top-1 border border-secondary text-xs bg-base-100 !p-2 rounded-box rounded-t-none"
            />
          )}
          {rockType === ERock.Asteroid && (
            <GracePeriod
              player={ownedBy as Entity}
              className="absolute left-6 -top-1 border border-secondary text-xs p-2 bg-base-100 rounded-box rounded-t-none"
            />
          )}
        </Tabs.Pane>
      </Tabs>
    </div>
  );
};
