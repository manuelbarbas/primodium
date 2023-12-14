import ERC20Abi from "contracts/out/ERC20System.sol/ERC20System.abi.json";
import { useMemo } from "react";
import { Link as NavLink, useLocation } from "react-router-dom";
import { Button } from "src/components/core/Button";
import { AddressDisplay } from "src/components/hud/AddressDisplay";
import { useMud } from "src/hooks";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { getNetworkConfig } from "src/network/config/getNetworkConfig";
import { world } from "src/network/world";
import { Hex, createPublicClient, createWalletClient, custom, getContract } from "viem";
import { toAccount } from "viem/accounts";
import { useAccount, useDisconnect } from "wagmi";
import { Link } from "./Link";
import { MintToken } from "./MintToken";
import { PlayerBalances } from "./PlayerBalances";
import { TransferToken } from "./TransferToken";
import { normalizeAddress } from "src/util/common";
import { ampli } from "src/ampli";
import { parseReceipt } from "src/util/analytics/parseReceipt";
import { convertObjToParams, convertParamsToObj } from "src/util/params";

type Tab = "transfer" | "mint" | "balances" | "link";

export function ControlPanel() {
  const { network } = useMud();
  const externalAccount = useAccount();
  const { disconnect } = useDisconnect();
  const { search } = useLocation();
  const params = useMemo(() => convertParamsToObj(search), [search]);
  const tab = params.tab as Tab | undefined;

  const externalAddress = externalAccount.address;

  const adminAddress = components.P_GameConfig.get()?.admin;

  const networkConfig = getNetworkConfig();
  const tokenAddress = components.P_GameConfig2.get()?.wETHAddress;

  const client = useMemo(() => {
    if (!externalAccount || !externalAccount.address || !tokenAddress) return;

    const clientOptions = {
      chain: networkConfig.chain,
      transport: custom(window.ethereum),
      pollingInterval: 1000,
      account: toAccount(externalAccount.address),
    };
    const publicClient = createPublicClient(clientOptions);
    const walletClient = createWalletClient(clientOptions);
    const tokenContract = getContract({
      address: tokenAddress as Hex,
      abi: ERC20Abi,
      publicClient,
      walletClient,
    });
    return { publicClient, walletClient, tokenContract };
  }, [networkConfig.chain, tokenAddress, externalAccount]);

  const burnerAddress = normalizeAddress(network.address);
  const isAdmin = externalAddress === adminAddress;

  const onMint = async (address: string, amount: bigint) => {
    if (!client) return;
    await execute(
      () => client.tokenContract.write.mint([address as Hex, BigInt(amount)]),
      network,
      {
        id: world.registerEntity(),
      },
      (receipt) => {
        ampli.tokenMint({
          tokenMintTo: address,
          tokenValue: amount.toString(),
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const onTransfer = async (address: string, amount: bigint) => {
    if (!client) return;
    await execute(
      () => client.tokenContract.write.transfer([address as Hex, amount]),
      network,
      {
        id: world.registerEntity(),
      },
      (receipt) => {
        ampli.tokenTransfer({
          tokenTransferTo: address,
          tokenValue: amount.toString(),
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const tabs: Tab[] = isAdmin ? ["link", "transfer", "mint", "balances"] : ["link", "transfer"];
  return (
    <>
      <div className="absolute top-4 margin-auto flex w-screen h-20 justify-between items-center p-4 z-10">
        <NavLink to={`/game${search}`}>
          <img src={"img/ios/mainbase-large-icon.png"} className={`w-20 pixel-images rounded-md`} />
        </NavLink>
        {externalAccount.isConnected && externalAddress && (
          <div className="bg-base-100 rounded-md flex items-center p-2 gap-2 ">
            <div className="flex flex-col">
              <div>
                <p className="text-xs text-gray-400 ">Connected to</p>
                <AddressDisplay className="text-sm" address={externalAddress} notShort />
              </div>
              <div>
                <p className="text-xs text-gray-400 ">Primodium (burner) account</p>
                <AddressDisplay address={burnerAddress} notShort className="text-sm" />
              </div>
            </div>
            <Button className="font-bold btn-secondary btn-sm h-full" onClick={() => disconnect()}>
              Disconnect
            </Button>
          </div>
        )}
      </div>

      {client && (
        <div className="h-full w-full relative flex flex-col justify-center items-center">
          <div
            className={`card flex flex-col border border-secondary p-2 gap-2 transition-all ${
              tab !== "balances" ? "w-[512px] h-72" : "w-3/4 h-3/4"
            }`}
          >
            <div className="flex gap-6">
              {tabs.map((tabName) => (
                <NavLink
                  className={tab === tabName ? "" : `opacity-50`}
                  key={`tabName-${tabName}`}
                  to={`/account${convertObjToParams({ ...params, tab: tabName })}`}
                >
                  {tabName}
                </NavLink>
              ))}
            </div>
            {tab === "transfer" && (
              <TransferToken onTransfer={onTransfer} className="col-span-2" client={client.publicClient} />
            )}
            {tab === "mint" && isAdmin && (
              <MintToken onMint={onMint} client={client.publicClient} className="col-span-2" />
            )}
            {tab === "balances" && isAdmin && <PlayerBalances className="col-span-4" />}
            {(!tab || tab === "link") && <Link />}
          </div>
        </div>
      )}
    </>
  );
}
