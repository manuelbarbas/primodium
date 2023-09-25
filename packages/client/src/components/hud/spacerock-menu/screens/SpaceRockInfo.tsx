import { SingletonID } from "@latticexyz/network";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { Account } from "src/network/components/clientComponents";
import { shortenAddress } from "src/util/common";
import { SpaceRockTypeNames, MotherlodeSizeNames } from "src/util/constants";
import { getSpaceRockInfo } from "src/util/spacerock";
import { ESpaceRockType } from "src/util/web3/types";

const DataLabel: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => {
  return (
    <SecondaryCard className="text-xs gap-2 w-full">
      <p className="text-xs opacity-75 mb-1 uppercase">{label}</p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </SecondaryCard>
  );
};

export const SpacerockInfo: React.FC<{
  data: ReturnType<typeof getSpaceRockInfo>;
}> = ({ data }) => {
  const player = Account.use(undefined, {
    value: SingletonID,
  }).value;

  return (
    <Navigator.Screen title="SpaceRockInfo" className="w-full">
      <DataLabel label="spacerock type">
        <b>{SpaceRockTypeNames[data.type]}</b>
      </DataLabel>
      <DataLabel label="owned by">
        <b>
          {data.ownedBy
            ? data.ownedBy === player
              ? "You"
              : shortenAddress(data.ownedBy)
            : "Neutral"}
        </b>
      </DataLabel>
      <div className="grid grid-cols-2 w-full">
        {data.mainBaseLevel && (
          <DataLabel label="level">
            <b>{data.mainBaseLevel}</b>
          </DataLabel>
        )}
        {data.type === ESpaceRockType.Motherlode && (
          <DataLabel label="COOLDOWN">
            <b>
              {data.motherlodeData.blocksLeft > 0
                ? data.motherlodeData.blocksLeft
                : "N/A"}
            </b>
          </DataLabel>
        )}
        <DataLabel label="coord">
          <b>
            [{data.position.x}, {data.position.y}]
          </b>
        </DataLabel>
      </div>
      <Navigator.BackButton className="mt-1" />
    </Navigator.Screen>
  );
};
