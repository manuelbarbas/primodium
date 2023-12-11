import { useEffect, useMemo, useState } from "react";
import { useMud } from "./useMud";
import { LinkedAddressResult, getLinkedAddress } from "src/util/web2/getLinkedAddress";
import { components } from "src/network/components";
import { getAllianceName } from "src/util/alliance";
import { Entity } from "@latticexyz/recs";
import { entityToAddress, isPlayer as _isPlayer } from "src/util/common";
import { entityToPlayerName } from "src/util/name";

export function useAccount(player?: Entity) {
  const { network } = useMud();
  const playerEntity = player ?? network.playerEntity;
  const [linkedAddress, setLinkedAddress] = useState<LinkedAddressResult>();
  const [loading, setLoading] = useState(true);
  const wETHBalance = components.WETHBalance.use(playerEntity)?.value ?? 0n;
  const alliance = components.PlayerAlliance.use(playerEntity)?.alliance;
  const allianceName = getAllianceName((alliance ?? "") as Entity);
  const isPlayer = _isPlayer(playerEntity);

  const address = useMemo(() => {
    if (!isPlayer) return "Pirate";
    if (!linkedAddress) return entityToPlayerName(playerEntity);
    return linkedAddress.ensName ?? entityToPlayerName(playerEntity);
  }, [linkedAddress, playerEntity]);

  useEffect(() => {
    if (!isPlayer) return;
    const getAddressObj = async () => {
      const addressObj = await getLinkedAddress(entityToAddress(playerEntity));
      setLinkedAddress(addressObj);
      setLoading(false);
    };
    getAddressObj();
  }, []);

  return {
    linkedAddress,
    wETHBalance,
    allianceName,
    address,
    loading,
    isPlayer,
  };
}
