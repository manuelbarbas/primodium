import { Entity } from "@latticexyz/recs";
import { Navigator } from "src/components/core/Navigator";
import { Header } from "../widgets/Header";
import { Upgrade } from "../widgets/Upgrade";

import { OpenMarket } from "../widgets/OpenMarket";

export const Market: React.FC<{ building: Entity }> = ({ building }) => {
  return (
    <Navigator.Screen title={building} className="w-full gap-1">
      <Header building={building} />
      <Upgrade building={building} />
      <OpenMarket />
    </Navigator.Screen>
  );
};
