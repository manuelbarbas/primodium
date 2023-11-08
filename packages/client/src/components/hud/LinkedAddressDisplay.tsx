import { Entity } from "@latticexyz/recs";
import { useEffect, useMemo, useState } from "react";
import { useMud } from "src/hooks";
import { entityToAddress, isPlayer, shortenAddress } from "src/util/common";
import { PIRATE_KEY } from "src/util/constants";
import { hashKeyEntity } from "src/util/encode";
import { LinkedAddressResult, getLinkedAddress } from "src/util/web2/getLinkedAddress";
import { Hex } from "viem";

export const LinkedAddressDisplay = ({ entity }: { entity: Entity }) => {
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
        const jsonRes = await getLinkedAddress(entityToAddress(entity));
        setFetchedExternalWallet(jsonRes);
      } catch (error) {
        return;
      }
    };
    fetchLocalLinkedAddress();
  }, [entity]);

  // Fetches and displays the linked address as a relevant string
  const entityDisplay: string = useMemo(() => {
    let entityDisplay = "Neutral";
    if (entity === playerEntity) {
      entityDisplay = "You";
    } else if (entity === hashKeyEntity(PIRATE_KEY, playerEntity)) {
      entityDisplay = "Pirates!";
    } else if (entity && !isPlayer(entity)) {
      entityDisplay = shortenAddress(entity as Hex);
    } else if (entity && entity !== playerEntity) {
      entityDisplay = fetchedExternalWallet.ensName ?? entityToAddress(fetchedExternalWallet.address ?? entity, true);
    }
    return entityDisplay;
  }, [fetchedExternalWallet, entity, playerEntity]);

  return <>{entityDisplay}</>;
};
