import { useMud } from "@/hooks";
import { AllResourceLabels } from "@/components/hud/resources/AllResourceLabels";
import { AllUtilityLabels } from "@/components/hud/resources/AllUtilityLabels";
import { Card, GlassCard } from "@/components/core/Card";
import { Tabs } from "@/components/core/Tabs";
import { IconLabel } from "@/components/core/IconLabel";
import { Mode } from "@/util/constants";
import { ResourceImages, UnitImages } from "@primodiumxyz/assets";
import { Hangar } from "@/components/hud/hangar/Hangar";

export const Resources = () => {
  const { components } = useMud();
  const mapOpen = components.SelectedMode.use()?.value !== Mode.Asteroid;

  if (mapOpen) return;

  return (
    <Tabs defaultIndex={0} className="pointer-events-auto flex items-center">
      <div className="flex flex-col gap-2">
        <Tabs.Button
          index={0}
          togglable
          size={"sm"}
          className="!border-r-0 animate-in fade-in zoom-in"
          style={{
            writingMode: "vertical-lr",
          }}
        >
          <IconLabel text="Resources" imageUri={ResourceImages.Iridium} className="gap-2 py-3" />
        </Tabs.Button>
        <Tabs.Button
          index={1}
          togglable
          size={"sm"}
          className="!border-r-0 animate-in fade-in zoom-in"
          style={{
            writingMode: "vertical-lr",
          }}
        >
          <IconLabel text="Units" imageUri={UnitImages.StingerDrone} className="gap-2 py-3" />
        </Tabs.Button>
      </div>

      <Tabs.Pane index={0} fragment>
        <GlassCard direction={"left"} className="animate-in slide-in-from-right-full">
          <Card noDecor>
            <AllResourceLabels />
            <AllUtilityLabels />
          </Card>
        </GlassCard>
      </Tabs.Pane>
      <Tabs.Pane index={1} fragment>
        <GlassCard direction={"left"} className="animate-in slide-in-from-right-full">
          <Card noDecor>
            <Hangar />
          </Card>
        </GlassCard>
      </Tabs.Pane>
    </Tabs>
  );
};
