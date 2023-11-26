import { useMud } from "src/hooks";
import { linkAddress } from "src/util/web2/linkAddress";
import { formatEther } from "viem";
import { Button } from "../core/Button";
import { useAccount } from "src/hooks/useAccount";
import { AccountDisplay } from "../shared/AccountDisplay";
import { FaLink } from "react-icons/fa";
import { components } from "src/network/components";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Entity } from "@latticexyz/recs";
import { IconLabel } from "../core/IconLabel";
import { primodium } from "@game/api";
import { SpriteKeys } from "@game/constants";

export const Profile = () => {
  const { network } = useMud();
  const playerEntity = network.playerEntity;
  const { linkedAddress, loading, wETHBalance } = useAccount(playerEntity);
  const mainBase = components.Home.use(playerEntity)?.mainBase;
  const mainbaseLevel = components.Level.use((mainBase ?? singletonEntity) as Entity)?.value ?? 1n;
  const { getSpriteBase64 } = primodium.api().sprite;

  return (
    <div className="flex flex-row">
      <Button className="flex flex-col justify-center border-t-0 border-secondary rounded-t-none ml-2 w-24 p-0">
        <IconLabel imageUri={getSpriteBase64(SpriteKeys.Mainbase1)} className="text-2xl -mt-2 scale-125 pt-3 pb-2" />
        <p className="bg-base-100 w-full rounded-b-2xl p-1 border-t border-secondary">
          <span className="text-accent">LVL.</span>
          {mainbaseLevel.toString()}
        </p>
      </Button>
      <div>
        <div className="flex flex-col p-1 bg-opacity-50 bg-neutral backdrop-blur-md rounded-box rounded-l-none rounded-t-none text-sm border border-secondary border-l-0">
          <div className="flex gap-2 items-center">
            <AccountDisplay player={playerEntity} />
          </div>
          <hr className="border-secondary/50" />
          <div className="flex gap-1 text-right w-full justify-end rounded-b-xl px-2 border-b border-secondary/50 pt-1">
            {formatEther(wETHBalance)}
            <p className="font-bold text-success">wETH</p>
          </div>
        </div>
        {!linkedAddress?.address && !loading && (
          <Button
            className="btn-xs btn-secondary btn-ghost flex gap-1 m-auto text-accent mt-1"
            onClick={() => linkAddress(network)}
          >
            <FaLink /> LINK ADDRESS
          </Button>
        )}
      </div>
    </div>
  );
};
