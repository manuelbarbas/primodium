import { Navigator } from "src/components/core/Navigator";
import { getSpaceRockInfo } from "src/util/spacerock";
import { Header } from "../widgets/Header";
import { Invade } from "../widgets/Invade";
import { Land } from "../widgets/Land";
import { Reinforce } from "../widgets/Reinforce";
import { StationedUnits } from "../widgets/StationedUnits";
import { MotherlodeResources } from "../widgets/MotherlodeResources";

export const Motherlode: React.FC<{
  data: ReturnType<typeof getSpaceRockInfo>;
}> = ({ data }) => {
  return (
    <Navigator.Screen title={data.entity} className="w-full">
      <Header entity={data.entity} name={data.name} imageUri={data.imageUri} />
      <MotherlodeResources motherlodeEntity={data.entity} />
      <div className="grid grid-cols-2 w-full">
        <Invade />
        <Reinforce />
      </div>
      <StationedUnits />
      <Land destination={data.entity} rockType={data.type} />
    </Navigator.Screen>
  );
};
