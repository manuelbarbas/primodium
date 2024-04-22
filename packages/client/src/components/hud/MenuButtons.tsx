import { SecondaryCard } from "../core/Card";
import { IconLabel } from "../core/IconLabel";
import { Join } from "../core/Join";
import { Modal } from "../core/Modal";
import { UnitUpgrades } from "./building-menu/screens/UnitUpgrades";
import { AllianceManagement } from "./modals/alliance-mgmt/AllianceManagement";
import { LeaderboardScreen } from "./modals/leaderboard/LeaderboardScreen";
import { Settings } from "./modals/settings/Settings";
import { BattleReports } from "./widgets/battle-reports/BattleReports";

const buttonClass = "rounded-t-none btn-sm pt-1 border border-dotted border-secondary/50";

export const MenuButtons = () => {
  return (
    <SecondaryCard className="flex flex-col items-center pointer-events-auto">
      <Join className="drop-shadow-hard border border-secondary/50" direction="vertical">
        <Modal title="alliance management">
          <Modal.Button className={buttonClass} tooltip="alliance management" tooltipDirection="right">
            <IconLabel imageUri="/img/icons/debugicon.png" />
          </Modal.Button>
          <Modal.Content className="w-[40rem] h-[50rem]">
            <AllianceManagement />
          </Modal.Content>
        </Modal>
        <Modal title="leaderboard">
          <Modal.Button className={buttonClass} tooltip="leaderboard" tooltipDirection="right">
            <IconLabel imageUri="/img/icons/leaderboardicon.png" />
          </Modal.Button>
          <Modal.Content className="w-[50rem] h-[50rem]">
            <LeaderboardScreen />
          </Modal.Content>
        </Modal>
        <Modal title="battles">
          <Modal.Button className={buttonClass} tooltip="battle reports" tooltipDirection="right">
            <IconLabel imageUri="/img/icons/reportsicon.png" />
          </Modal.Button>
          <Modal.Content className="w-[40rem] h-[50rem]">
            <BattleReports />
          </Modal.Content>
        </Modal>
        <Modal title="upgrade units">
          <Modal.Button className={buttonClass} tooltip="upgrade units" tooltipDirection="right">
            <IconLabel imageUri="/img/icons/addicon.png" />
          </Modal.Button>
          <Modal.Content className="w-[62rem]">
            <UnitUpgrades />
          </Modal.Content>
        </Modal>
        <Modal title="settings">
          <Modal.Button className={buttonClass} tooltip="settings" tooltipDirection="right">
            <IconLabel imageUri="/img/icons/settingsicon.png" />
          </Modal.Button>
          <Modal.Content className="w-132 h-120">
            <Settings />
          </Modal.Content>
        </Modal>
      </Join>
    </SecondaryCard>
  );
};
