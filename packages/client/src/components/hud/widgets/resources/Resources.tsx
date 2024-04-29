import { useMud } from "@/hooks";
import { AllResourceLabels } from "@/components/hud/widgets/resources/AllResourceLabels";
import { AllUtilityLabels } from "@/components/hud/widgets/resources/AllUtilityLabels";
import { Card, GlassCard } from "@/components/core/Card";
import { Tabs } from "@/components/core/Tabs";
import { IconLabel } from "@/components/core/IconLabel";
import { Mode } from "@/util/constants";
import { ResourceImages } from "@primodiumxyz/assets";

export const Resources = () => {
  const { components } = useMud();
  const mapOpen = components.SelectedMode.use()?.value !== Mode.Asteroid;

  if (mapOpen) return;

  return (
    <Tabs defaultIndex={0} className="pointer-events-auto flex items-center">
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
      <Tabs.Pane index={0} fragment>
        <GlassCard direction={"left"} className="animate-in slide-in-from-right-full">
          <Card noDecor>
            <AllResourceLabels />
            <AllUtilityLabels />
          </Card>
        </GlassCard>
      </Tabs.Pane>
    </Tabs>
  );
};
