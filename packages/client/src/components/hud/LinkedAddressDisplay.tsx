import { Entity } from "@latticexyz/recs";
import { useEffect, useMemo, useState } from "react";
import { useMud } from "src/hooks";
import { entityToAddress, isPlayer, shortenAddress } from "src/util/common";
import { PIRATE_KEY } from "src/util/constants";
import { hashKeyEntity } from "src/util/encode";
import { LinkedAddressResult, getLinkedAddress } from "src/util/web2/getLinkedAddress";
import { Hex } from "viem";

export const LinkedAddressDisplay = ({
  entity,
  fullAddress = true, // for statistics dashboard, always display full address
}: {
  entity: Entity;
  fullAddress?: boolean;
}) => {
  const network = useMud().network;
  const playerEntity = network.playerEntity;

  const [fetchedExternalWallet, setFetchedExternalWallet] = useState<LinkedAddressResult>({
    address: null,
    ensName: null,
  });

  useEffect(() => {
    const fetchLocalLinkedAddress = async () => {
      try {
        if (!isPlayer(entity)) return;
        // hard = true and fetchEnsName = true if fullAddress is true
        const jsonRes = await getLinkedAddress(entityToAddress(entity), fullAddress, !fullAddress);
        setFetchedExternalWallet(jsonRes);
      } catch (error) {
        return;
      }
    };
    fetchLocalLinkedAddress();
  }, [entity, fullAddress]);

  // Fetches and displays the linked address as a relevant string
  const entityDisplay: string = useMemo(() => {
    let entityDisplay = "Neutral";
    if (entity === playerEntity && !fullAddress) {
      entityDisplay = "You";
    } else if (entity === hashKeyEntity(PIRATE_KEY, playerEntity)) {
      entityDisplay = "Pirates!";
    } else if (entity && isPlayer(entity)) {
      entityDisplay =
        fetchedExternalWallet.ensName ?? entityToAddress(fetchedExternalWallet.address ?? entity, !fullAddress);
    } else {
      entityDisplay = shortenAddress(entity as Hex);
    }
    return entityDisplay;
  }, [entity, playerEntity, fullAddress, fetchedExternalWallet.ensName, fetchedExternalWallet.address]);

  return <>{entityDisplay}</>;
};
