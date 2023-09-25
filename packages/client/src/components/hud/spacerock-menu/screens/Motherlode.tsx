import { Navigator } from "src/components/core/Navigator";
import { Header } from "../widgets/Header";
import { getSpaceRockInfo } from "src/util/spacerock";
import { MotherlodeResource } from "../widgets/MotherlodeResource";
import { SingletonID } from "@latticexyz/network";
import { Invade } from "../widgets/Invade";
import { Reinforce } from "../widgets/Reinforce";
import { StationedUnits } from "../widgets/StationedUnits";

export const Motherlode: React.FC<{
  data: ReturnType<typeof getSpaceRockInfo>;
}> = ({ data }) => {
  return (
    <Navigator.Screen title={data.entity} className="w-fit">
      <Header name={data.name} imageUri={data.imageUri} />
      <MotherlodeResource
        resource={data.motherlodeData.resource ?? SingletonID}
        remaining={data.motherlodeData.resourceLeft}
        max={data.motherlodeData.maxAmount ?? 0}
      />
      <div className="grid grid-cols-2 w-full">
        <Invade />
        <Reinforce type={data.type} />
      </div>
      <StationedUnits />
    </Navigator.Screen>
  );
};
