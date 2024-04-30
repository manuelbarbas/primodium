import { Card, GlassCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { Tabs } from "@/components/core/Tabs";
import { NavigatorPane } from "@/components/hud/widgets/navigator/NavigatorPane";
import { Mode } from "@/util/constants";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { memo } from "react";
import { useMud } from "src/hooks";

export const Navigator = memo(() => {
  const { components } = useMud();
  const mapOpen = components.SelectedMode.use()?.value !== Mode.Asteroid;

  if (!mapOpen) return null;

  return (
    <Tabs defaultIndex={0} className="pointer-events-auto flex items-center">
      <Tabs.Button
        index={0}
        togglable
        size={"sm"}
        className="heropattern-topography-slate-500/10 !border-r-0 animate-in fade-in zoom-in"
        style={{
          writingMode: "vertical-rl",
        }}
      >
        <IconLabel text="Navigator" imageUri={InterfaceIcons.Debug} className="gap-2 py-4" />
      </Tabs.Button>
      <Tabs.Pane index={0} fragment>
        <GlassCard direction={"left"} className="animate-in slide-in-from-right-full">
          <Card fragment noDecor>
            <NavigatorPane />
          </Card>
        </GlassCard>
      </Tabs.Pane>
    </Tabs>
  );
});
