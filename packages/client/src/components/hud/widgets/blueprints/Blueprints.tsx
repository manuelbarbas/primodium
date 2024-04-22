import { memo } from "react";
import { useMud } from "src/hooks";
import { BlueprintPane } from "./BlueprintPane";
import { IconLabel } from "@/components/core/IconLabel";
import { Tabs } from "@/components/core/Tabs";

export const Blueprints = memo(() => {
  const { components } = useMud();
  const mapOpen = components.MapOpen.use()?.value;
  const isBuilding = components.ActiveRock.use()?.value === components.BuildRock.use()?.value;

  if (mapOpen || !isBuilding) return;

  return (
    <Tabs defaultIndex={0} className="pointer-events-auto flex items-center">
      <Tabs.Pane index={0} className="animate-in fade-in-0 slide-in-from-left-full">
        <BlueprintPane />
      </Tabs.Pane>
      <Tabs.Button
        index={0}
        togglable
        size={"sm"}
        className="border-l-0 heropattern-topography-slate-500/10"
        style={{
          writingMode: "vertical-lr",
        }}
      >
        <IconLabel text="Blueprints" imageUri="/img/icons/blueprinticon.png" className="gap-2 py-4" />
      </Tabs.Button>
    </Tabs>
  );
});
