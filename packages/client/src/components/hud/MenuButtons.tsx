import { IconLabel } from "../core/IconLabel";
import { Join } from "../core/Join";
import { Modal } from "../core/Modal";
import { Leaderboard } from "./modals/leaderboard/Leaderboard";
import { Settings } from "./modals/settings/Settings";
import { BattleReports } from "./panes/battle-reports/BattleReports";

const buttonClass = "rounded-t-none btn-sm pt-1 border border-l-0 border-dotted border-secondary/50";

export const MenuButtons = () => {
  return (
    <div className="flex flex-col items-center">
      <Join className="drop-shadow-hard" direction="vertical">
        <Modal title="leaderboard">
          <Modal.Button className={buttonClass}>
            <IconLabel imageUri="/img/icons/leaderboardicon.png" tooltipText="leaderboard" tooltipDirection="right" />
          </Modal.Button>
          <Modal.Content className="w-[40rem] h-[50rem]">
            <Leaderboard />
          </Modal.Content>
        </Modal>
        <Modal title="battles">
          <Modal.Button className={buttonClass}>
            <IconLabel imageUri="/img/icons/reportsicon.png" tooltipText="battles" tooltipDirection="right" />
          </Modal.Button>
          <Modal.Content className="w-[40rem] h-[50rem]">
            <BattleReports />
          </Modal.Content>
        </Modal>
        <Modal title="settings">
          <Modal.Button className={buttonClass}>
            <IconLabel imageUri="/img/icons/settingsicon.png" tooltipText="settings" tooltipDirection="right" />
          </Modal.Button>
          <Modal.Content className="w-132 h-120">
            <Settings />
          </Modal.Content>
        </Modal>
      </Join>
    </div>
  );
};
