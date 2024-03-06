import { SecondaryCard } from "../core/Card";
import { IconLabel } from "../core/IconLabel";
import { Join } from "../core/Join";
import { Modal } from "../core/Modal";
import { UnitUpgrades } from "./building-menu/screens/UnitUpgrades";
import { Leaderboard } from "./modals/leaderboard/Leaderboard";
import { Settings } from "./modals/settings/Settings";
import { BattleReports } from "./panes/battle-reports/BattleReports";

const buttonClass = "rounded-t-none btn-sm pt-1 border border-dotted border-secondary/50";

export const MenuButtons = () => {
  return (
    <SecondaryCard className="flex flex-col items-center">
      <Join className="drop-shadow-hard border border-secondary/50" direction="vertical">
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
        <Modal title="upgrade units">
          <Modal.Button className={buttonClass}>
            <IconLabel imageUri="/img/icons/addicon.png" tooltipText="upgrade units" tooltipDirection="right" />
          </Modal.Button>
          <Modal.Content className="w-[58rem]">
            <UnitUpgrades />
          </Modal.Content>
        </Modal>
        <Modal title="settings">
          <Modal.IconButton
            className={buttonClass}
            imageUri="/img/icons/settingsicon.png"
            tooltipDirection="right"
            tooltipText="settings"
          />
          <Modal.Content className="w-132 h-120">
            <Settings />
          </Modal.Content>
        </Modal>
      </Join>
    </SecondaryCard>
  );
};
