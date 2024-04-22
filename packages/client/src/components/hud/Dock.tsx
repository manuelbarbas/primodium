import { Objectives } from "@/components/hud/modals/Objectives";
import { SecondaryCard } from "@/components/core/Card";
import { IconLabel } from "../core/IconLabel";
import { Modal } from "../core/Modal";
import { AllianceManagement } from "./modals/alliance-mgmt/AllianceManagement";
import { LeaderboardScreen } from "./modals/leaderboard/LeaderboardScreen";
import { Settings } from "./modals/settings/Settings";
import { BattleReports } from "./widgets/battle-reports/BattleReports";

export const Dock = () => {
  return (
    <div className="translate-y-1/2">
      <SecondaryCard className="bg-secondary/10 heropattern-topography-white/10">
        <div className="flex flex-row gap-2 items-center pointer-events-auto -translate-y-1/2">
          <Modal title="alliance management">
            <Modal.Button
              className="hover:drop-shadow-xl hover:shadow-accent/25"
              shape={"square"}
              size={"lg"}
              variant={"neutral"}
              tooltip="alliance management"
            >
              <IconLabel imageUri="/img/icons/debugicon.png" />
            </Modal.Button>
            <Modal.Content className="w-[40rem] h-[50rem]">
              <AllianceManagement />
            </Modal.Content>
          </Modal>
          <Modal title="leaderboard">
            <Modal.Button
              className="hover:drop-shadow-xl hover:shadow-accent/25"
              tooltip="leaderboard"
              shape={"square"}
              size={"lg"}
              variant={"neutral"}
            >
              <IconLabel imageUri="/img/icons/leaderboardicon.png" />
            </Modal.Button>
            <Modal.Content className="w-[50rem] h-[50rem]">
              <LeaderboardScreen />
            </Modal.Content>
          </Modal>
          <Modal title="battles">
            <Modal.Button
              className="hover:drop-shadow-xl hover:shadow-accent/25"
              tooltip="battle reports"
              shape={"square"}
              size={"lg"}
              variant={"neutral"}
            >
              <IconLabel className="text-2xl" imageUri="/img/icons/reportsicon.png" />
            </Modal.Button>
            <Modal.Content className="w-[40rem] h-[50rem]">
              <BattleReports />
            </Modal.Content>
          </Modal>
          <Modal title="Objectives">
            <Modal.Button
              className="hover:drop-shadow-xl hover:shadow-accent/25"
              tooltip="Objectives"
              shape={"square"}
              size={"lg"}
              variant={"neutral"}
            >
              <IconLabel imageUri="/img/icons/objectiveicon.png" />
            </Modal.Button>
            <Modal.Content className="w-[50rem] h-[50rem]">
              <Objectives />
            </Modal.Content>
          </Modal>
          <Modal title="settings">
            <Modal.Button
              className="hover:drop-shadow-xl hover:shadow-accent/25"
              tooltip="settings"
              shape={"square"}
              size={"lg"}
              variant={"neutral"}
            >
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
