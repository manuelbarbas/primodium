import { memo } from "react";
import { useMud } from "src/hooks";
import { HangarContent } from "./HangarContent";
import { Mode } from "@/util/constants";
import { Card } from "@/components/core/Card";

export const Hangar = memo(() => {
  const { components } = useMud();
  const mapOpen = components.SelectedMode.use()?.value !== Mode.Asteroid;

  if (mapOpen) return;

  return (
    <Card noDecor className="w-72">
      <HangarContent />
    </Card>
  );
});
