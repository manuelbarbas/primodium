import { Entity } from "@latticexyz/recs";
import ERC20Abi from "contracts/out/ERC20System.sol/ERC20System.abi.json";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "src/components/core/Button";
import { AddressDisplay } from "src/components/hud/AddressDisplay";
import { useMud } from "src/hooks";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { getNetworkConfig } from "src/network/config/getNetworkConfig";
import { world } from "src/network/world";
import { Hex, createPublicClient, createWalletClient, custom, encodeAbiParameters, getContract, trim } from "viem";
import { toAccount } from "viem/accounts";
import { useAccount, useDisconnect } from "wagmi";
import { MintToken } from "./MintToken";
import { PlayerBalances } from "./PlayerBalances";
import { TransferToken } from "./TransferToken";

type Tab = "transfer" | "mint" | "balances";

export function ControlPanel() {
  const { network } = useMud();
  const externalAccount = useAccount();
  const { disconnect } = useDisconnect();
  const [tab, setTab] = useState<Tab>("transfer");
  const { search } = useLocation();

  const externalAddress = externalAccount.address;
  const externalEntity = externalAccount.address
    ? (encodeAbiParameters([{ type: "address" }], [externalAccount.address]) as Entity)
    : undefined;

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

  const burnerAddress = trim(network.address);
  const isAdmin = externalAddress === adminAddress;

  const onMint = async (address: string, amount: number) => {
    if (!client) return;
    await execute(() => client.tokenContract.write.mint([address as Hex, BigInt(amount)]), network, {
      id: world.registerEntity(),
    });
  };

  const onTransfer = async (address: string, amount: number) => {
    if (!client) return;
    await execute(() => client.tokenContract.write.transfer([address as Hex, BigInt(amount)]), network, {
      id: world.registerEntity(),
    });
  };

  const tabs: Tab[] = isAdmin ? ["transfer", "mint", "balances"] : ["transfer"];
  return (
    <>
      <div className="absolute top-4 margin-auto flex w-screen h-20 justify-between items-center p-4 z-10">
        <Link to={`/game${search}`}>
          <img src={"img/ios/mainbase-large-icon.png"} className={`w-20 pixel-images rounded-md`} />
        </Link>
        {externalAccount.isConnected && externalAddress && (
          <div className="bg-base-100 rounded-md flex items-center p-2 gap-2 ">
            <div className="flex flex-col">
              <div>
                <p className="text-xs text-gray-400 ">Connected to</p>
                <p className="text-sm">
                  <AddressDisplay address={externalAddress} notShort />
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 ">Primodium (burner) account</p>
                <p className="text-sm">
                  <AddressDisplay address={burnerAddress} notShort />
                </p>
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
                <button
                  key={tabName}
                  onClick={() => setTab(tabName)}
                  className={`${tab !== tabName ? "opacity-50" : ""}`}
                  disabled={tabName === tab}
                >
                  {tabName}
                </button>
              ))}
            </div>
            {tab === "transfer" && externalEntity && (
              <TransferToken
                onTransfer={onTransfer}
                className="col-span-2"
                burnerAddress={burnerAddress}
                externalEntity={externalEntity}
                client={client.publicClient}
              />
            )}
            {tab === "mint" && isAdmin && (
              <MintToken onMint={onMint} client={client.publicClient} className="col-span-2" />
            )}
            {tab === "balances" && isAdmin && <PlayerBalances className="col-span-4" />}
          </div>
        </div>
      )}
    </>
  );
}
