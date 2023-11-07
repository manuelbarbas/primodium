import { Entity } from "@latticexyz/recs";
import { useEffect, useMemo, useState } from "react";
import { useMud } from "src/hooks";
import { entityToAddress } from "src/util/common";
import { LinkedAddressResult, getLinkedAddress } from "src/util/web2/getLinkedAddress";

export const PlayerLinkedAddress = ({ player }: { player: Entity }) => {
  const network = useMud().network;
  const playerEntity = network.playerEntity;

  const [fetchedExternalWallet, setFetchedExternalWallet] = useState<LinkedAddressResult>({
    address: entityToAddress(player),
    ensName: null,
  });

  useEffect(() => {
    const fetchLocalLinkedAddress = async () => {
      try {
        const jsonRes = await getLinkedAddress(entityToAddress(player));
        setFetchedExternalWallet(jsonRes);
      } catch (error) {
        return;
      }
    };
    fetchLocalLinkedAddress();
  }, [player]);

  const playerDisplay: string = useMemo(() => {
    if (player === playerEntity) return "You";
    return fetchedExternalWallet.ensName ?? entityToAddress(fetchedExternalWallet.address ?? player, true);
  }, [fetchedExternalWallet, player, playerEntity]);

  return <>{playerDisplay}</>;
};
