import { Entity } from "@primodiumxyz/reactive-tables";
import { Navigator } from "@/components/core/Navigator";
import { Upgrade } from "../widgets/Upgrade";

export const Basic: React.FC<{ building: Entity }> = ({ building }) => {
  return (
    <Navigator.Screen title={building} className="gap-1">
      <Upgrade building={building} />
    </Navigator.Screen>
  );
};
