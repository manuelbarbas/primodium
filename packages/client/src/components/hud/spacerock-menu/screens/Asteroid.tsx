import { Navigator } from "src/components/core/Navigator";
import { Header } from "../widgets/Header";
import { getSpaceRockInfo } from "src/util/spacerock";
import { Raid } from "../widgets/Raid";
import { Reinforce } from "../widgets/Reinforce";
import { AsteroidResource } from "../widgets/AsteroidResource";

export const Asteroid: React.FC<{
  data: ReturnType<typeof getSpaceRockInfo>;
}> = ({ data }) => {
  return (
    <Navigator.Screen title={data.entity} className="w-fit">
      <Header name={data.name} imageUri={data.imageUri} />
      <AsteroidResource resources={data.resources} />
      <div className="grid grid-cols-2 w-full">
        <Raid />
        <Reinforce />
      </div>
    </Navigator.Screen>
  );
};
