import { memo } from "react";

import { EntityType } from "@primodiumxyz/core";
import { Card, GlassCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { Tabs } from "@/components/core/Tabs";
import { InventoryPane } from "@/components/hud/asteroid/inventory/InventoryPane";
import { EntityToResourceImage } from "@/util/image";

export const Inventory = memo(() => {
  return (
    <Tabs className="flex items-center" persistIndexKey="inventory">
      <Tabs.Button
        index={0}
        togglable
        size={"sm"}
        className="pointer-events-auto heropattern-topography-slate-500/10 !border-r-0 animate-in fade-in zoom-in !z-0"
        style={{
          writingMode: "vertical-rl",
        }}
      >
        <IconLabel
          text="Inventory"
          imageUri={EntityToResourceImage[EntityType.Iridium]}
          className="gap-2 py-4"
          style={{
            writingMode: "vertical-lr",
          }}
        />
      </Tabs.Button>

      <Tabs.Pane index={0} fragment className="pointer-events-auto">
        <GlassCard direction={"left"} className="animate-in slide-in-from-right-full">
          <Card fragment noDecor>
            <InventoryPane />
          </Card>
        </GlassCard>
      </Tabs.Pane>
    </Tabs>
  );
});
