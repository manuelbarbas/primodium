import { memo } from "react";
import { useMud } from "src/hooks";
import { BlueprintPane } from "./BlueprintPane";
import { IconLabel } from "@/components/core/IconLabel";
import { Tabs } from "@/components/core/Tabs";
import { Card, GlassCard } from "@/components/core/Card";
import { Mode } from "@/util/constants";
import { InterfaceIcons } from "@primodiumxyz/assets";

export const Blueprints = memo(() => {
  const { components } = useMud();
  const mapOpen = components.SelectedMode.use()?.value !== Mode.Asteroid;
  const isBuilding = components.ActiveRock.use()?.value === components.BuildRock.use()?.value;

  if (mapOpen || !isBuilding) return;

  return (
    <Tabs defaultIndex={0} className="pointer-events-auto flex items-center">
      <Tabs.Pane index={0} fragment>
        <GlassCard direction={"right"} className="animate-in slide-in-from-left-full">
          <Card fragment noDecor>
            <BlueprintPane />
          </Card>
        </GlassCard>
      </Tabs.Pane>
      <Tabs.Button
        index={0}
        togglable
        size={"sm"}
        className="heropattern-topography-slate-500/10 !border-l-0 animate-in fade-in zoom-in"
        style={{
          writingMode: "vertical-lr",
        }}
      >
        <IconLabel text="Blueprints" imageUri={InterfaceIcons.Navigator} className="gap-2 py-4" />
      </Tabs.Button>
    </Tabs>
  );
});
