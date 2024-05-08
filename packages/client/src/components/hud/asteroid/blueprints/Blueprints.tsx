import { Card, GlassCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { Tabs } from "@/components/core/Tabs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { memo } from "react";
import { useMud } from "src/hooks";
import { BlueprintPane } from "./BlueprintPane";

export const Blueprints = memo(() => {
  const { components } = useMud();
  const isBuilding = components.ActiveRock.use()?.value === components.BuildRock.use()?.value;

  if (!isBuilding) return;

  return (
    <Tabs className="pointer-events-auto flex items-center" persistIndexKey="blueprints">
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
        <IconLabel text="Blueprints" imageUri={InterfaceIcons.Blueprints} className="gap-2 py-4" />
      </Tabs.Button>
    </Tabs>
  );
});
