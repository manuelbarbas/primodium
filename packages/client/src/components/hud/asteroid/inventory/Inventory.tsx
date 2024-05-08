import { Card, GlassCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { Tabs } from "@/components/core/Tabs";
import { InventoryPane } from "@/components/hud/asteroid/inventory/InventoryPane";
import { EntityType, Mode } from "@/util/constants";
import { EntityToResourceImage } from "@/util/mappings";
import { memo } from "react";
import { useMud } from "src/hooks";

export const Inventory = memo(() => {
  const { components } = useMud();
  const mapOpen = components.SelectedMode.use()?.value !== Mode.Asteroid;

  if (mapOpen) return;

  return (
    <Tabs className="pointer-events-auto flex items-center" persistIndexKey="inventory">
      <Tabs.Button
        index={0}
        togglable
        size={"sm"}
        className="heropattern-topography-slate-500/10 !border-r-0 animate-in fade-in zoom-in"
        style={{
          writingMode: "vertical-rl",
        }}
      >
        <IconLabel text="Inventory" imageUri={EntityToResourceImage[EntityType.Iridium]} className="gap-2 py-4" />
      </Tabs.Button>

      <Tabs.Pane index={0} fragment>
        <GlassCard direction={"left"} className="animate-in slide-in-from-right-full">
          <Card fragment noDecor>
            <InventoryPane />
          </Card>
        </GlassCard>
      </Tabs.Pane>
    </Tabs>
  );
});
