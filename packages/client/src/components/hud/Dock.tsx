import { GlassCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { Modal } from "@/components/core/Modal";
import { AllianceManagement } from "@/components/hud/modals/alliance-mgmt/AllianceManagement";
import { LeaderboardScreen } from "@/components/hud/modals/leaderboard/LeaderboardScreen";
import { ObjectivesScreen } from "@/components/hud/modals/objectives/ObjectivesScreen";
import { Settings } from "./modals/settings/Settings";
import { BattleReports } from "./widgets/battle-reports/BattleReports";

const btnClass = "hover:drop-shadow-xl group hover:bg-transparent";
const iconClass = "text-3xl hover:animate-float drop-shadow-hard";

export const Dock = () => {
  return (
    <div className="translate-y-1/2">
      <GlassCard direction={"top"}>
        <div className="flex flex-row gap-2 items-center pointer-events-auto -translate-y-[40px]">
          <Modal title="alliance management">
            <Modal.Button
              className={btnClass}
              shape={"circle"}
              size={"lg"}
              variant={"ghost"}
              tooltip="alliance management"
            >
              <IconLabel imageUri="/img/icons/allianceicon.png" className={iconClass} />
            </Modal.Button>
            <Modal.Content className="w-[40rem] h-[50rem]">
              <AllianceManagement />
            </Modal.Content>
          </Modal>
          <Modal title="leaderboard">
            <Modal.Button className={btnClass} tooltip="leaderboard" shape={"circle"} size={"lg"} variant={"ghost"}>
              <IconLabel className={iconClass} imageUri="/img/icons/leaderboardicon.png" />
            </Modal.Button>
            <Modal.Content className="w-[50rem] h-[50rem]">
              <LeaderboardScreen />
            </Modal.Content>
          </Modal>
          <Modal title="battles">
            <Modal.Button className={btnClass} tooltip="battle reports" shape={"circle"} size={"lg"} variant={"ghost"}>
              <IconLabel className={iconClass} imageUri="/img/icons/reportsicon.png" />
            </Modal.Button>
            <Modal.Content className="w-[40rem] h-[50rem]">
              <BattleReports />
            </Modal.Content>
          </Modal>
          <Modal title="Objectives">
            <Modal.Button className={btnClass} tooltip="Objectives" shape={"circle"} size={"lg"} variant={"ghost"}>
              <IconLabel className={iconClass} imageUri="/img/icons/objectiveicon.png" />
            </Modal.Button>
            <Modal.Content className="w-[50rem] h-[60rem]">
              <ObjectivesScreen />
            </Modal.Content>
          </Modal>
          <Modal title="settings">
            <Modal.Button className={btnClass} tooltip="settings" shape={"circle"} size={"lg"} variant={"ghost"}>
              <IconLabel className={iconClass} imageUri="/img/icons/settingsicon.png" />
            </Modal.Button>
            <Modal.Content className="w-132 h-120">
              <Settings />
            </Modal.Content>
          </Modal>
        </div>
      </GlassCard>
    </div>
  );
};
