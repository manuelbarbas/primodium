import { useMud } from "@/hooks";
import { AllResourceLabels } from "@/components/hud/widgets/resources/AllResourceLabels";
import { AllUtilityLabels } from "@/components/hud/widgets/resources/AllUtilityLabels";
import { Card } from "@/components/core/Card";
import { Tabs } from "@/components/core/Tabs";
import { IconLabel } from "@/components/core/IconLabel";

export const Resources = () => {
  const { components } = useMud();
  const mapOpen = components.MapOpen.use()?.value;

  if (mapOpen) return;

  return (
    <Tabs defaultIndex={0} className="pointer-events-auto flex items-center">
      <Tabs.Button
        index={0}
        togglable
        size={"sm"}
        style={{
          writingMode: "vertical-lr",
        }}
      >
        <IconLabel text="Resources" imageUri="/img/resource/iridium_resource.png" className="gap-2 py-2" />
      </Tabs.Button>
      <Tabs.Pane index={0}>
        <Card noDecor>
          <AllResourceLabels />
          <AllUtilityLabels />
        </Card>
      </Tabs.Pane>
    </Tabs>
  );
};
