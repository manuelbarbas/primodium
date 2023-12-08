import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { getSpaceRockInfo } from "src/util/spacerock";
import { GracePeriod } from "../../GracePeriod";
import { AsteroidResource } from "../widgets/AsteroidResource";
import { Header } from "../widgets/Header";
import { Land } from "../widgets/Land";
import { Raid } from "../widgets/Raid";
import { Reinforce } from "../widgets/Reinforce";

export const Asteroid: React.FC<{
  data: ReturnType<typeof getSpaceRockInfo>;
}> = ({ data }) => {
  const playerEntity = useMud().network.playerEntity;

  return (
    <Navigator.Screen title={data.entity} className="w-full">
      <Header spaceRock={data.entity} name={data.name} imageUri={data.imageUri} />
      <AsteroidResource resources={data.resources} />
      {data.ownedBy && playerEntity !== data.ownedBy && <GracePeriod player={data.ownedBy} />}
      {(!data.isInGracePeriod || playerEntity === data.ownedBy) && (
        <div className="grid grid-cols-2 w-full">
          <Raid />
          <Reinforce />
        </div>
      )}
      <Land destination={data.entity} rockType={data.type} />
    </Navigator.Screen>
  );
};
