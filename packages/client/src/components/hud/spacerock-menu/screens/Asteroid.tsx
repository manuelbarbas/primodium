import dayjs from "dayjs";
import { FaDove } from "react-icons/fa";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { getSpaceRockInfo } from "src/util/spacerock";
import { useNow } from "src/util/time";
import { AsteroidResource } from "../widgets/AsteroidResource";
import { Header } from "../widgets/Header";
import { Land } from "../widgets/Land";
import { Raid } from "../widgets/Raid";
import { Reinforce } from "../widgets/Reinforce";

export const Asteroid: React.FC<{
  data: ReturnType<typeof getSpaceRockInfo>;
}> = ({ data }) => {
  const playerEntity = useMud().network.playerEntity;
  const time = useNow();
  const duration = dayjs.duration(Number(data.gracePeriodValue - time) * 1000);
  return (
    <Navigator.Screen title={data.entity} className="w-full">
      <Header name={data.name} imageUri={data.imageUri} />
      <AsteroidResource resources={data.resources} />
      {data.isInGracePeriod && (
        <p className="text-sm text-success text-center w-full font-bold flex items-center gap-2 justify-center pt-2">
          <FaDove /> {duration.format("mm [min] ss [sec]")}
        </p>
      )}
      {(!data.isInGracePeriod || playerEntity == data.ownedBy) && (
        <div className="grid grid-cols-2 w-full">
          <Raid />
          <Reinforce />
        </div>
      )}
      <Land destination={data.entity} rockType={data.type} />
    </Navigator.Screen>
  );
};
