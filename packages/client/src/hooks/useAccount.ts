import { Entity } from "@latticexyz/recs";
import { useEffect, useMemo, useState } from "react";
import { components } from "src/network/components";
import { getAllianceName } from "src/util/alliance";
import { isPlayer as _isPlayer, entityToAddress, shortenAddress } from "src/util/common";
import { entityToPlayerName } from "src/util/name";
import { LinkedAddressResult, getEnsName } from "src/util/web3/getEnsName";

export function useAccount(playerEntity: Entity, address?: boolean) {
  const [linkedAddress, setLinkedAddress] = useState<LinkedAddressResult>();
  const [loading, setLoading] = useState(true);
  const wETHBalance = components.WETHBalance.use(playerEntity)?.value ?? 0n;
  const alliance = components.PlayerAlliance.use(playerEntity)?.alliance;
  const allianceName = getAllianceName((alliance ?? "") as Entity);
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
    wETHBalance,
    allianceName,
    address: name,
    loading,
    isPlayer,
  };
}
