import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { shortenAddress } from "src/util/common";
import { PIRATE_KEY, SpaceRockTypeNames } from "src/util/constants";
import { hashKeyEntity } from "src/util/encode";
import { getSpaceRockInfo } from "src/util/spacerock";

const DataLabel: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  return (
    <SecondaryCard className="text-xs gap-2 w-full">
      <p className="text-xs opacity-75 mb-1 uppercase">{label}</p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </SecondaryCard>
  );
};

export const SpacerockInfo: React.FC<{
  data: ReturnType<typeof getSpaceRockInfo>;
}> = ({ data: { ownedBy, type, position, mainBaseLevel } }) => {
  const playerEntity = useMud().network.playerEntity;
  let owner = "Neutral";
  if (ownedBy === playerEntity) owner = "You";
  else if (ownedBy === hashKeyEntity(PIRATE_KEY, playerEntity)) owner = "Pirates!";
  else if (ownedBy && ownedBy !== playerEntity) owner = shortenAddress(ownedBy);

  return (
    <Navigator.Screen title="SpaceRockInfo" className="w-full">
      <DataLabel label="spacerock type">
        <b>{SpaceRockTypeNames[type]}</b>
      </DataLabel>
      <DataLabel label="owned by">
        <b>{owner}</b>
      </DataLabel>
      <div className="grid grid-cols-2 w-full">
        {mainBaseLevel !== undefined && (
          <DataLabel label="level">
            <b>{mainBaseLevel.toString() ?? 1}</b>
          </DataLabel>
        )}
        <DataLabel label="coord">
          <b>
            [{position.x}, {position.y}]
          </b>
        </DataLabel>
      </div>
      <Navigator.BackButton className="mt-1" />
    </Navigator.Screen>
  );
};
