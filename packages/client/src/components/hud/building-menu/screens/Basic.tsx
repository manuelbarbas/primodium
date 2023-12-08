import { Entity } from "@latticexyz/recs";
import { Navigator } from "src/components/core/Navigator";
import { Header } from "../widgets/Header";
import { Upgrade } from "../widgets/Upgrade";

export const Basic: React.FC<{ building: Entity }> = ({ building }) => {
  return (
    <Navigator.Screen title={building} className="gap-1">
      <Header building={building} />
      <Upgrade building={building} />
    </Navigator.Screen>
  );
};
