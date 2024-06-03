import { GlassCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { Modal } from "@/components/core/Modal";
import { AllianceManagement } from "@/components/hud/global/modals/alliance-mgmt/AllianceManagement";
import { LeaderboardScreen } from "@/components/hud/global/modals/leaderboard/LeaderboardScreen";
import { ObjectivesScreen } from "@/components/hud/global/modals/objectives/ObjectivesScreen";
import { Cheatcodes } from "@/components/hud/global/modals/dev/Cheatcodes";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { Settings } from "./modals/settings/Settings";
import { BattleReports } from "./modals/battle-reports/BattleReports";

const btnClass = "group hover:bg-transparent hover:scale-[115%]";
const iconClass = "text-3xl";
const DEV = import.meta.env.PRI_DEV === "true";

export const Dock = () => {
  return (
    <GlassCard direction={"top"} className="h-12 px-5">
      <div className="flex flex-row gap-2 items-center pointer-events-auto -translate-y-[35px]">
        <Modal title="Alliance Management">
          <Modal.Button
            className={btnClass}
            shape={"circle"}
            size={"lg"}
            variant={"ghost"}
            tooltip="Alliance&nbsp;Management"
          >
            <IconLabel imageUri={InterfaceIcons.Alliance} className={iconClass} />
          </Modal.Button>
          <Modal.Content className="w-[40rem] h-[40rem]">
            <AllianceManagement />
          </Modal.Content>
        </Modal>
        <Modal title="Leaderboard">
          <Modal.Button className={btnClass} tooltip="Leaderboard" shape={"circle"} size={"lg"} variant={"ghost"}>
            <IconLabel className={iconClass} imageUri={InterfaceIcons.Leaderboard} />
          </Modal.Button>
          <Modal.Content className="w-[50rem] h-[50rem]">
            <LeaderboardScreen />
          </Modal.Content>
        </Modal>
        <Modal title="Battles">
          <Modal.Button
            className={btnClass}
            tooltip="Battle&nbsp;Reports"
            shape={"circle"}
            size={"lg"}
            variant={"ghost"}
          >
            <IconLabel className={iconClass} imageUri={InterfaceIcons.Reports} />
          </Modal.Button>
          <Modal.Content className="w-[50rem] h-[45rem]">
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
        <Modal title="Settings">
          <Modal.Button className={btnClass} tooltip="Settings" shape={"circle"} size={"lg"} variant={"ghost"}>
            <IconLabel className={iconClass} imageUri={InterfaceIcons.Settings} />
          </Modal.Button>
          <Modal.Content className="w-132 h-120">
            <Settings />
          </Modal.Content>
        </Modal>
        {DEV && (
          <Modal title="Cheatcodes">
            <Modal.Button className={btnClass} tooltip="Cheatcodes" shape={"circle"} size={"lg"} variant={"ghost"}>
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
