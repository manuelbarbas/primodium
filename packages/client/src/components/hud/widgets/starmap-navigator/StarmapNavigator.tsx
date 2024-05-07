import { Card, GlassCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { Tabs } from "@/components/core/Tabs";
import { StarmapNavigatorPane } from "@/components/hud/widgets/starmap-navigator/StarmapNavigatorPane";
import { Mode } from "@/util/constants";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { memo, useState } from "react";
import { useMud } from "src/hooks";

export const StarmapNavigator = memo(() => {
  const { components } = useMud();
  const [open, setOpen] = useState(false);
  const mapOpen = components.SelectedMode.use()?.value === Mode.Starmap;

  if (!mapOpen) return null;

  return (
    <Tabs defaultIndex={open ? 0 : 1} className="pointer-events-auto flex items-center">
      <Tabs.Button
        index={0}
        togglable
        size={"sm"}
        className="heropattern-topography-slate-500/10 !border-r-0 animate-in fade-in zoom-in"
        style={{
          writingMode: "vertical-rl",
        }}
        onClick={() => setOpen(!open)}
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
