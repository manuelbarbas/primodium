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
  shorten = true,
  displayReadable = true,
}: {
  entity: Entity;
  shorten?: boolean;
  displayReadable?: boolean;
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
      entityDisplay = displayReadable
        ? "You"
        : fetchedExternalWallet.ensName ??
          entityToAddress(fetchedExternalWallet.address ?? entity, shorten) ??
          entityToAddress(entity);
    } else if (entity === hashKeyEntity(PIRATE_KEY, playerEntity)) {
      entityDisplay = displayReadable ? "Pirates!" : entity;
    } else if (entity && !isPlayer(entity)) {
      entityDisplay = shorten ? shortenAddress(entity as Hex) : entityToAddress(entity);
    } else {
      entityDisplay =
        fetchedExternalWallet.ensName ?? entityToAddress(fetchedExternalWallet.address ?? entity, shorten);
    }
    return entityDisplay;
  }, [entity, playerEntity, displayReadable, shorten, fetchedExternalWallet.ensName, fetchedExternalWallet.address]);

  return <>{entityDisplay}</>;
};
