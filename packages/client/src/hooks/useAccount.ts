import { Entity } from "@latticexyz/recs";
import { useEffect, useMemo, useState } from "react";
import { components } from "src/network/components";
import { getAllianceName } from "src/util/alliance";
import { isPlayer as _isPlayer, entityToAddress } from "src/util/common";
import { entityToPlayerName } from "src/util/name";
import { LinkedAddressResult, getEnsName } from "src/util/web3/getEnsName";
import { useMud } from "./useMud";

export function useAccount(player?: Entity) {
  const { playerAccount } = useMud();
  const playerEntity = player ?? playerAccount.entity;
  const [linkedAddress, setLinkedAddress] = useState<LinkedAddressResult>();
  const [loading, setLoading] = useState(true);
  const wETHBalance = components.WETHBalance.use(playerEntity)?.value ?? 0n;
  const alliance = components.PlayerAlliance.use(playerEntity)?.alliance;
  const allianceName = getAllianceName((alliance ?? "") as Entity);
  const isPlayer = _isPlayer(playerEntity);

  const address = useMemo(() => {
    if (!linkedAddress) return entityToPlayerName(playerEntity);
    return (
      linkedAddress.ensName ??
      (linkedAddress.address
        ? entityToAddress(linkedAddress.address ?? playerEntity, true)
        : entityToPlayerName(playerEntity))
    );
  }, [linkedAddress, playerEntity]);

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
    address,
    loading,
    isPlayer,
  };
}
