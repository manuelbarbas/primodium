import { chunk } from "lodash";
import React, { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAccount, useConnect, useSwitchChain } from "wagmi";

import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";
import { Landing } from "@/screens/Landing";

const connectorIcons: Record<string, string> = {
  ["MetaMask"]: "/img/icons/web3/metamask.svg",
  ["WalletConnect"]: "/img/icons/web3/walletconnect.svg",
  ["Coinbase Wallet"]: "/img/icons/web3/coinbase.svg",
};

const TARGET_CHAIN_ID = 37084624;
const TARGET_CHAIN_NAME = "[S] Nebula Gaming Hub";

export const Connect: React.FC = React.memo(() => {
  const { connector, isConnected, chainId } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { switchChain } = useSwitchChain();
  const { noExternalAccount, setNoExternalAccount } = usePersistentStore();
  const [showingToast, setShowingToast] = useState(false);
  const [showingChainToast, setShowingChainToast] = useState(false);

  useEffect(() => {
    if (error) toast.warn(error.message);
  }, [error]);

  // Check chain when wallet connects
  useEffect(() => {
    if (isConnected && chainId && chainId !== TARGET_CHAIN_ID && !showingChainToast) {
      showChainSwitchToast();
    }
  }, [isConnected, chainId, showingChainToast]);

  const showChainSwitchToast = async () => {
    toast.dismiss();
    if (showingChainToast) await new Promise((resolve) => setTimeout(resolve, 500));
    setShowingChainToast(true);

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col text-center justify-center items-center gap-2 w-full">
            <FaExclamationTriangle size={24} className="text-warning" />
            <div>WRONG NETWORK. Switch to {TARGET_CHAIN_NAME} to continue.</div>
          </div>

          <div className="flex justify-center w-full gap-2">
            <button
              className="btn btn-primary"
              onClick={async () => {
                try {
                  await switchChain({ chainId: TARGET_CHAIN_ID });
                  closeToast && closeToast();
                } catch (error) {
                  console.error("Failed to switch chain:", error);
                  toast.error("Failed to switch network. Please switch manually in your wallet.");
                }
              }}
            >
              {`Switch to`} <br /> {`${TARGET_CHAIN_NAME}`}
            </button>
            <button
              onClick={() => {
                setShowingChainToast(false);
                closeToast && closeToast();
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        hideProgressBar: true,
      },
    );
  };

  const confirmToast = async () => {
    toast.dismiss();
    if (showingToast) await new Promise((resolve) => setTimeout(resolve, 500));
    setShowingToast(true);
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col text-center justify-center items-center gap-2 w-full">
            <FaExclamationTriangle size={24} className="text-warning" />
            Are you sure you want to login as guest? You will not be able to win prizes or play across devices.
          </div>

          <div className="flex justify-center w-full gap-2">
            <button
              className="btn btn-secondary btn-xs"
              onClick={() => {
                setNoExternalAccount(true);
                closeToast && closeToast();
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => {
                setShowingToast(false);
                closeToast && closeToast();
              }}
              className="btn btn-primary btn-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        hideProgressBar: true,
      },
    );
  };

  const handleConnectorClick = async (connectorToConnect: (typeof connectors)[0]) => {
    if (isPending) return;

    try {
      await connect({ connector: connectorToConnect });
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const shouldShowConnect = !isConnected || (isConnected && chainId !== TARGET_CHAIN_ID);

  if (!shouldShowConnect && !noExternalAccount) return null;
  if (noExternalAccount) return null;

  return (
    <Landing>
      <div className="flex flex-col gap-2 w-full">
        <button
          className="btn-lg btn-secondary star-background w-full btn join-item inline pointer-events-auto font-bold outline-none h-fit z-10"
          onClick={confirmToast}
        >
          Quick Login
        </button>

        {chunk(
          connectors.filter((x) => x.id !== connector?.id),
          2,
        ).map((chunk, i) => (
          <div key={`chunk-${i}`} className="flex flex-row gap-2">
            {chunk.map((x) => (
              <button
                className="flex-1 items-center justify-center btn btn-secondary star-background join-item inline pointer-events-auto font-bold outline-none h-fit z-10"
                key={`${x.id}-${x.name}`}
                onClick={() => handleConnectorClick(x)}
                disabled={isPending}
              >
                <div className="flex w-full items-center justify-center gap-2">
                  {connectorIcons[x.name] && <img src={connectorIcons[x.name]} className="w-6 h-6" />}
                  {x.name}
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </Landing>
  );
});
