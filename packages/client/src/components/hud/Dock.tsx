import { GlassCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { Modal } from "@/components/core/Modal";
import { AllianceManagement } from "@/components/hud/modals/alliance-mgmt/AllianceManagement";
import { LeaderboardScreen } from "@/components/hud/modals/leaderboard/LeaderboardScreen";
import { ObjectivesScreen } from "@/components/hud/modals/objectives/ObjectivesScreen";
import { Cheatcodes } from "@/components/hud/widgets/dev/Cheatcodes";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { Settings } from "./modals/settings/Settings";
import { BattleReports } from "./widgets/battle-reports/BattleReports";

const btnClass = "group hover:bg-transparent hover:scale-[115%]";
const iconClass = "text-3xl";

export const Dock = () => {
  const DEV = import.meta.env.PRI_DEV === "true";

  return (
    <GlassCard direction={"top"} className="h-12 px-5">
      <div className="flex flex-row gap-2 items-center pointer-events-auto -translate-y-[35px]">
        <Modal title="alliance management">
          <Modal.Button
            className={btnClass}
            shape={"circle"}
            size={"lg"}
            variant={"ghost"}
            tooltip="alliance management"
          >
            <IconLabel imageUri={InterfaceIcons.Alliance} className={iconClass} />
          </Modal.Button>
          <Modal.Content className="w-[40rem] h-[50rem]">
            <AllianceManagement />
          </Modal.Content>
        </Modal>
        <Modal title="leaderboard">
          <Modal.Button className={btnClass} tooltip="leaderboard" shape={"circle"} size={"lg"} variant={"ghost"}>
            <IconLabel className={iconClass} imageUri={InterfaceIcons.Leaderboard} />
          </Modal.Button>
          <Modal.Content className="w-[50rem] h-[50rem]">
            <LeaderboardScreen />
          </Modal.Content>
        </Modal>
        <Modal title="battles">
          <Modal.Button className={btnClass} tooltip="battle reports" shape={"circle"} size={"lg"} variant={"ghost"}>
            <IconLabel className={iconClass} imageUri={InterfaceIcons.Reports} />
          </Modal.Button>
          <Modal.Content className="w-[40rem] h-[50rem]">
            <BattleReports />
          </Modal.Content>
        </Modal>
        <Modal title="Objectives">
          <Modal.Button className={btnClass} tooltip="Objectives" shape={"circle"} size={"lg"} variant={"ghost"}>
            <IconLabel className={iconClass} imageUri={InterfaceIcons.Objective} />
          </Modal.Button>
          <Modal.Content className="w-[50rem] h-[60rem]">
            <ObjectivesScreen />
          </Modal.Content>
        </Modal>
        <Modal title="settings">
          <Modal.Button className={btnClass} tooltip="settings" shape={"circle"} size={"lg"} variant={"ghost"}>
            <IconLabel className={iconClass} imageUri={InterfaceIcons.Settings} />
          </Modal.Button>
          <Modal.Content className="w-132 h-120">
            <Settings />
          </Modal.Content>
        </Modal>
        {DEV && (
          <Modal title="cheatcodes">
            <Modal.Button className={btnClass} tooltip="cheatcodes" shape={"circle"} size={"lg"} variant={"ghost"}>
              <IconLabel className={iconClass} imageUri={InterfaceIcons.Debug} />
            </Modal.Button>
            <Modal.Content className="h-[700px] w-[500px] font-mono">
              <Cheatcodes />
            </Modal.Content>
          </Modal>
        )}
      </div>
    </GlassCard>
  );
};
