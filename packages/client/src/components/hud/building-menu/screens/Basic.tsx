import { Entity } from "@latticexyz/recs";
import { Navigator } from "src/components/core/Navigator";
import { BuildingInfo } from "../widgets/BuildingInfo";
import { Upgrade } from "../widgets/Upgrade";

export const Basic: React.FC<{ building: Entity }> = ({ building }) => {
  return (
    <Navigator.Screen title={building} className="gap-1">
      <BuildingInfo />
      <Upgrade building={building} />
    </Navigator.Screen>
  );
};
