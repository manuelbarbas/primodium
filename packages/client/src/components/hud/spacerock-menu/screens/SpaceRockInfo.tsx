import { Entity } from "@latticexyz/recs";
import { useEffect, useMemo, useState } from "react";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { entityToAddress, isPlayer, shortenAddress } from "src/util/common";
import { PIRATE_KEY, SpaceRockTypeNames } from "src/util/constants";
import { hashKeyEntity } from "src/util/encode";
import { getSpaceRockInfo } from "src/util/spacerock";
import { LinkedAddressResult, getLinkedAddress } from "src/util/web2/getLinkedAddress";
import { Hex } from "viem";

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

  // Fetch externally linked addresses
  const [fetchedExternalWallet, setFetchedExternalWallet] = useState<LinkedAddressResult>({
    address: null,
    ensName: null,
  });

  useEffect(() => {
    const fetchLocalLinkedAddress = async () => {
      if (!ownedBy) return;
      try {
        const jsonRes = await getLinkedAddress(entityToAddress(ownedBy));
        setFetchedExternalWallet(jsonRes);
      } catch (error) {
        return;
      }
    };
    fetchLocalLinkedAddress();
  }, [ownedBy]);

  const ownerDisplay: string = useMemo(() => {
    let owner = "Neutral";
    if (ownedBy === playerEntity) owner = "You";
    else if (ownedBy === hashKeyEntity(PIRATE_KEY, playerEntity)) owner = "Pirates!";
    else if (ownedBy && !isPlayer(ownedBy as Entity)) owner = shortenAddress(ownedBy as Hex);
    else if (ownedBy && ownedBy !== playerEntity)
      owner = fetchedExternalWallet.ensName ?? entityToAddress(fetchedExternalWallet.address ?? ownedBy, true);
    return owner;
  }, [fetchedExternalWallet, ownedBy, playerEntity]);

  return (
    <Navigator.Screen title="SpaceRockInfo" className="w-full">
      <DataLabel label="spacerock type">
        <b>{SpaceRockTypeNames[type]}</b>
      </DataLabel>
      <DataLabel label="owned by">
        <b>{ownerDisplay}</b>
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
