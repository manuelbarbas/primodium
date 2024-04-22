import { SecondaryCard } from "../core/Card";
import { IconLabel } from "../core/IconLabel";
import { Modal } from "../core/Modal";
import { UnitUpgrades } from "./building-menu/screens/UnitUpgrades";
import { AllianceManagement } from "./modals/alliance-mgmt/AllianceManagement";
import { LeaderboardScreen } from "./modals/leaderboard/LeaderboardScreen";
import { Settings } from "./modals/settings/Settings";
import { BattleReports } from "./widgets/battle-reports/BattleReports";

// const buttonClass = "rounded-t-none btn-sm pt-1 border border-dotted border-secondary/50";

export const Dock = () => {
  return (
    <div className="translate-y-1/2">
      <SecondaryCard className="bg-secondary/10 heropattern-topography-white/10">
        <div className="flex flex-row gap-2 items-center pointer-events-auto -translate-y-1/2">
          <Modal title="alliance management">
            <Modal.Button shape={"square"} size={"lg"} variant={"neutral"} tooltip="alliance management">
              <IconLabel imageUri="/img/icons/debugicon.png" />
            </Modal.Button>
            <Modal.Content className="w-[40rem] h-[50rem]">
              <AllianceManagement />
            </Modal.Content>
          </Modal>
          <Modal title="leaderboard">
            <Modal.Button tooltip="leaderboard" shape={"square"} size={"lg"} variant={"neutral"}>
              <IconLabel imageUri="/img/icons/leaderboardicon.png" />
            </Modal.Button>
            <Modal.Content className="w-[50rem] h-[50rem]">
              <LeaderboardScreen />
            </Modal.Content>
          </Modal>
          <Modal title="battles">
            <Modal.Button tooltip="battle reports" shape={"square"} size={"lg"} variant={"neutral"}>
              <IconLabel imageUri="/img/icons/reportsicon.png" />
            </Modal.Button>
            <Modal.Content className="w-[40rem] h-[50rem]">
              <BattleReports />
            </Modal.Content>
          </Modal>
          <Modal title="upgrade units">
            <Modal.Button tooltip="upgrade units" shape={"square"} size={"lg"} variant={"neutral"}>
              <IconLabel imageUri="/img/icons/addicon.png" />
            </Modal.Button>
            <Modal.Content className="w-[62rem]">
              <UnitUpgrades />
            </Modal.Content>
          </Modal>
          <Modal title="settings">
            <Modal.Button tooltip="settings" shape={"square"} size={"lg"} variant={"neutral"}>
              <IconLabel imageUri="/img/icons/settingsicon.png" />
            </Modal.Button>
            <Modal.Content className="w-132 h-120">
              <Settings />
            </Modal.Content>
          </Modal>
        </div>
      </SecondaryCard>
    </div>
  );
};
