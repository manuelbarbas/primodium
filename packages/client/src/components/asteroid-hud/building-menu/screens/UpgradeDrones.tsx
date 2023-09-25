import { Navigator } from "src/components/core/Navigator";
import { ResearchItem } from "../widgets/ResearchItem";
import {
  AegisDroneUpgradeTree,
  AnvilDroneUpgradeTree,
  HammerDroneUpgradeTree,
  StingerDroneUpgradeTree,
} from "src/util/research";

export const UpgradeDrones = () => {
  return (
    <Navigator.Screen title="UpgradeDrones" className="flex items-center">
      <div className="grid grid-cols-2 w-full mb-2 gap-1">
        <ResearchItem data={AnvilDroneUpgradeTree} />
        <ResearchItem data={HammerDroneUpgradeTree} />
        <ResearchItem data={StingerDroneUpgradeTree} />
        <ResearchItem data={AegisDroneUpgradeTree} />
      </div>

      <Navigator.BackButton />
    </Navigator.Screen>
  );
};
