import { Entity } from "@primodiumxyz/reactive-tables";
import { useEffect, useMemo, useState } from "react";
import { useCore } from "@/react/hooks/useCore";
import { isPlayer as _isPlayer, entityToAddress, shortenAddress } from "@/utils/global/common";
import { getEnsName, LinkedAddressResult } from "@/utils/global/ens";
import { entityToPlayerName } from "@/utils/global/name";

/**
 * Retrieves the player name and related information.
 *
 * @param playerEntity - The player entity.
 * @param address - Optional boolean flag indicating whether to include the player's address.
 * @returns An object containing the linked address, alliance name, player address, loading state, and player flag.
 */
export function usePlayerName(playerEntity: Entity, address?: boolean) {
  const {
    tables,
    utils: { decodeAllianceName },
    config,
  } = useCore();

  const [linkedAddress, setLinkedAddress] = useState<LinkedAddressResult>();
  const [loading, setLoading] = useState(true);
  const alliance = tables.PlayerAlliance.get(playerEntity)?.alliance as Entity;
  const allianceInfo = tables.Alliance.get(alliance);
  const allianceName = decodeAllianceName(allianceInfo?.name ?? "");
  const isPlayer = _isPlayer(playerEntity);

  const name = useMemo(() => {
    if (!linkedAddress) return entityToPlayerName(playerEntity);
    return linkedAddress.ensName ?? address
      ? shortenAddress(entityToAddress(playerEntity))
      : entityToPlayerName(playerEntity);
  }, [linkedAddress, playerEntity, address]);

  useEffect(() => {
    if (!isPlayer) {
      setLinkedAddress(undefined);
      return;
    }
    const getAddressObj = async () => {
      const addressObj =
        !playerEntity || !config.accountLinkUrl ? undefined : await getEnsName(config.accountLinkUrl, playerEntity);
      setLinkedAddress(addressObj);
      setLoading(false);
    };
    getAddressObj();
  }, [isPlayer, playerEntity]);

  return {
    linkedAddress,
    allianceName,
    address: name,
    loading,
    isPlayer,
  };
}
