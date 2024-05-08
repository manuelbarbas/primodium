import { Card, GlassCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { Tabs } from "@/components/core/Tabs";
import { StarmapNavigatorPane } from "@/components/hud/starbelt/starmap-navigator/StarmapNavigatorPane";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { memo } from "react";

export const StarmapNavigator = memo(() => {
  return (
    <Tabs className="pointer-events-auto flex items-center" persistIndexKey="navigator">
      <Tabs.Button
        index={0}
        togglable
        size={"sm"}
        className="heropattern-topography-slate-500/10 !border-r-0 animate-in fade-in zoom-in"
        style={{
          writingMode: "vertical-rl",
        }}
      >
        <IconLabel text="Navigator" imageUri={InterfaceIcons.Navigator} className="gap-2 py-4" />
      </Tabs.Button>
      <Tabs.Pane index={0} fragment>
        <GlassCard direction={"left"} className="animate-in slide-in-from-right-full">
          <Card fragment noDecor>
            <StarmapNavigatorPane />
          </Card>
        </GlassCard>
      </Tabs.Pane>
    </Tabs>
  );
});
