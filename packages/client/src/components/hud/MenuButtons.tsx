import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { IconLabel } from "../core/IconLabel";
import { Modal } from "../core/Modal";
import { UpgradeUnit } from "./building-menu/screens/UpgradeUnit";
import { Leaderboard } from "./modals/leaderboard/Leaderboard";
import { Settings } from "./modals/settings/Settings";
import { BattleReports } from "./panes/battle-reports/BattleReports";

export const MenuButtons = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const asteroid = components.ActiveRock.use()?.value;
  const ownedBy = components.OwnedBy.use(asteroid)?.value;
  const isSpectating = ownedBy !== playerEntity;
  return (
    <div className="flex flex-col items-center">
      <div className="flex pl-2 gap-1 drop-shadow-hard">
        <Modal title="leaderboard">
          <Modal.Button className="rounded-t-none border border-t-0 pt-3 pb-2 border-secondary btn-sm text-base">
            <IconLabel imageUri="/img/icons/leaderboardicon.png" tooltipText="leaderboard" tooltipDirection="bottom" />
          </Modal.Button>
          <Modal.Content className="w-[40rem] h-[50rem]">
            <Leaderboard />
          </Modal.Content>
        </Modal>
        <Modal title="battles">
          <Modal.Button className="rounded-t-none border border-t-0 pt-3 pb-2 border-secondary btn-sm text-base">
            <IconLabel imageUri="/img/icons/reportsicon.png" tooltipText="battles" tooltipDirection="bottom" />
          </Modal.Button>
          <Modal.Content className="w-[40rem] h-[50rem]">
            <BattleReports />
          </Modal.Content>
        </Modal>
        <Modal title="settings">
          <Modal.Button className="rounded-t-none border border-t-0 pt-3 pb-2 border-secondary btn-sm text-base">
            <IconLabel imageUri="/img/icons/settingsicon.png" tooltipText="settings" tooltipDirection="bottom" />
          </Modal.Button>
          <Modal.Content className="w-132 h-96">
            <Settings />
          </Modal.Content>
        </Modal>
        {!isSpectating && (
          <Modal title="upgrade units">
            <Modal.Button className="rounded-t-none border border-t-0 pt-3 pb-2 border-secondary btn-sm text-base">
              <IconLabel
                imageUri="/img/unit/trident_marine.png"
                tooltipText="upgrade units"
                tooltipDirection="bottom"
              />
            </Modal.Button>
            <Modal.Content>
              <UpgradeUnit />
            </Modal.Content>
          </Modal>
        )}
      </div>
    </div>
  );
};
