import { useEffect, useMemo, useState } from "react";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { entityToAddress } from "src/util/common";
import { LinkedAddressResult, getLinkedAddress } from "src/util/web2/getLinkedAddress";
import { linkAddress } from "src/util/web2/linkAddress";
import { formatEther } from "viem";
import { Button } from "../core/Button";
import { Card } from "../core/Card";

export const Profile = () => {
  const { network } = useMud();
  const playerEntity = network.playerEntity;
  const [linkedAddress, setLinkedAddress] = useState<LinkedAddressResult>();
  const [loading, setLoading] = useState(true);
  const wETHBalance = components.WETHBalance.use(playerEntity)?.value ?? 0n;

  const entityDisplay = useMemo(() => {
    if (!linkedAddress) return "...";
    return linkedAddress.ensName ?? entityToAddress(linkedAddress.address ?? playerEntity, true);
  }, [linkedAddress, playerEntity]);

  useEffect(() => {
    const getAddressObj = async () => {
      const addressObj = await getLinkedAddress();
      setLinkedAddress(addressObj);
      setLoading(false);
    };
    getAddressObj();
  }, []);

  const address = useMud().network.address;
  const data = components.Leaderboard.use();

  if (!data || !address) return null;

  if (loading) return <Card>loading...</Card>;

  return (
    <Card className="flex gap-1 text-sm flex-grow items-center justify-between w-fit">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 border border-accent rounded-md p-1">
            {formatEther(wETHBalance)}
            <p className="flex text-xs bg-warning px-1 rounded-sm font-bold items-center">WETH</p>
          </div>
          <p>{entityDisplay}</p>

          {!linkedAddress?.ensName && (
            <Button className="btn-xs btn-secondary" onClick={() => linkAddress(network)}>
              Link Wallet
            </Button>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <p className="bg-error px-2 rounded-md font-bold">
            <span>#{data.playerRank}</span>
          </p>
          <div className="flex items-center gap-1">
            <span>{data.scores.length >= data.playerRank ? data.scores[data.playerRank - 1].toLocaleString() : 0}</span>
            <p className="text-xs opacity-50"> PTS </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
