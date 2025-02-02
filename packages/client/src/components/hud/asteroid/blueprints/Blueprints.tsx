import { memo } from "react";

import { InterfaceIcons } from "@primodiumxyz/assets";
import { useCore } from "@primodiumxyz/core/react";
import { Card, GlassCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { Tabs } from "@/components/core/Tabs";

import { BlueprintPane } from "./BlueprintPane";

export const Blueprints = memo(() => {
  const { tables } = useCore();
  const isBuilding = tables.ActiveRock.use()?.value === tables.BuildRock.use()?.value;

  if (!isBuilding) return;

  return (
    <Tabs className="flex items-center" persistIndexKey="blueprints">
      <Tabs.Pane index={0} fragment>
        <GlassCard direction={"right"} className="pointer-events-auto animate-in slide-in-from-left-full">
          <Card fragment noDecor>
            <BlueprintPane />
          </Card>
        </GlassCard>
      </Tabs.Pane>
      <Tabs.Button
        index={0}
        togglable
        size={"sm"}
        className="pointer-events-auto heropattern-topography-slate-500/10 !border-l-0 animate-in fade-in zoom-in"
        style={{
          writingMode: "vertical-lr",
        }}
      >
        <IconLabel
          text="Blueprints"
          imageUri={InterfaceIcons.Blueprints}
          className="gap-2 py-4"
          style={{
            writingMode: "vertical-lr",
          }}
        />
      </Tabs.Button>
    </Tabs>
  );
});
