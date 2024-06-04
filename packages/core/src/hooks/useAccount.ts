import { Entity } from "@latticexyz/recs";
import { useEffect, useMemo, useState } from "react";
import { useMud } from "@/hooks/useMud";
import { isPlayer as _isPlayer, entityToAddress, shortenAddress } from "@/utils/global/common";
import { getEnsName, LinkedAddressResult } from "@/utils/global/getEnsName";
import { entityToPlayerName } from "@/utils/global/name";

export function useAccount(playerEntity: Entity, address?: boolean) {
  const {
    components,
    utils: { decodeAllianceName },
  } = useMud();
  const [linkedAddress, setLinkedAddress] = useState<LinkedAddressResult>();
  const [loading, setLoading] = useState(true);
  const allianceInfo = components.PlayerAllianceInfo.use(playerEntity);
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
      const addressObj = await getEnsName(playerEntity);
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
