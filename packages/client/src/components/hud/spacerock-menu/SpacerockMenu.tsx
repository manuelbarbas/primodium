import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMud } from "src/hooks";
import { components } from "src/network/components";

import { Entity } from "@latticexyz/recs";
import { IconLabel } from "src/components/core/IconLabel";
import { Tabs } from "src/components/core/Tabs";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { getSpaceRockImage, getSpaceRockName } from "src/util/spacerock";
import { GracePeriod } from "../GracePeriod";
import { Resources } from "./widgets/resources/Resources";

export const SpacerockMenu: React.FC = () => {
  const playerEntity = useMud().network.playerEntity;
  const selectedSpacerock = components.SelectedRock.use()?.value;
  const ownedBy = components.OwnedBy.use(selectedSpacerock)?.value ?? playerEntity;
  if (!selectedSpacerock) return null;
  const img = getSpaceRockImage(selectedSpacerock ?? singletonEntity);
  const name = getSpaceRockName(selectedSpacerock ?? singletonEntity);
  const coord = components.Position.get(selectedSpacerock ?? singletonEntity) ?? { x: 0, y: 0 };
  return (
    <div className="w-screen px-2 flex justify-center">
      <Tabs className="min-w-fit w-[50rem] flex flex-col items-center gap-0">
        <Tabs.Button
          index={0}
          togglable
          onClick={() => {
            components.SelectedBuilding.remove();
            components.SelectedAction.remove();
          }}
          className="rounded-b-none border-b-0 btn-md border-secondary relative py-2 hover:text-accent group w-fit"
        >
          {/* <FaCaretUp size={22} className="text-accent absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full" /> */}
          <IconLabel imageUri={img} className="" text={name} />
          <p className="scale-95 opacity-50">
            [{coord.x}, {coord.y}]
          </p>
        </Tabs.Button>
        <Tabs.Pane index={0} className="w-full border-b-0 rounded-x-none rounded-b-none relative">
          <Resources />
          <AccountDisplay
            player={ownedBy as Entity}
            showSpectate
            className="absolute right-6 -top-1 border border-secondary text-xs bg-base-100 !p-2 rounded-box rounded-t-none"
          />
          <GracePeriod
            player={ownedBy as Entity}
            className="absolute left-6 -top-1 border border-secondary text-xs p-2 bg-base-100 rounded-box rounded-t-none"
          />
        </Tabs.Pane>
      </Tabs>
    </div>
  );
};
