import { useState } from "react";

import {
  useAccount as useWagmiAccount,
  useConnect,
  useDisconnect,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

import { BsQuestionCircle } from "react-icons/bs";
import { ImTwitter } from "react-icons/im";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { FaMinusSquare } from "react-icons/fa";
import { FaPlusSquare } from "react-icons/fa";
import { FaFlagCheckered } from "react-icons/fa";
import Spinner from "./Spinner";
import { useTransactionLoading } from "../context/TransactionLoadingContext";
import NavigateMainBaseButton from "./action/NavigateMainBaseButton";

function InfoBox() {
  const { address, isConnected } = useWagmiAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  function handleWalletLogin(): void {
    connect();
  }

  function handleWalletLogout(): void {
    disconnect();
  }

  const [minimized, setMinimize] = useState(false);

  const minimizeBox = () => {
    if (minimized) {
      setMinimize(false);
    } else {
      setMinimize(true);
    }
  };

  const { transactionLoading } = useTransactionLoading();

  if (!isConnected) {
    return (
      <div className="z-[1000] fixed top-4 left-4 h-44 w-64 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
        <div className="mt-4 ml-5 flex flex-col">
          <div className="flex flex-row">
            <div className="flex items-center mb-2">
              <p className="inline-block align-middle text-xl font-bold">
                Primodium
              </p>
              <div>
                <a
                  href="https://discord.com/invite/bn7eSSKFWV"
                  target="_blank"
                  className="text-sm inline-block hover:text-gray-300 ml-3"
                >
                  <LinkIcon icon={<FaDiscord size="16" />} />
                </a>
                <a
                  href="hhttps://twitter.com/primodiumgame"
                  target="_blank"
                  className="text-sm inline-block hover:text-gray-300 ml-3"
                >
                  <LinkIcon icon={<FaTwitter size="16" />} />
                </a>
              </div>
            </div>
            <div className="ml-3">{transactionLoading && <Spinner />}</div>
          </div>
          <div className="flex"></div>
          <div className="flex items-center mb-2">
            <a
              href="https://tutorial.primodium.com"
              target="_blank"
              className="text-sm inline-block hover:text-gray-300"
            >
              <LinkIcon icon={<BsQuestionCircle size="16" />} />
              <p className="inline-block align-middle ml-2">How to play</p>
            </a>
          </div>
          <div className="flex items-center mb-2">
            <a
              target="_blank"
              href="https://www.primodium.com/seasons"
              className="text-sm inline-block hover:text-gray-300"
            >
              <LinkIcon icon={<FaFlagCheckered size="16" />} />
              <p className="inline-block align-middle ml-2">Past seasons</p>
            </a>
          </div>
        </div>

        <NavigateMainBaseButton />

        {/* External wallet button is hiden */}
        <button
          onClick={handleWalletLogin}
          className="absolute inset-x-4 bottom-4 h-10 bg-orange-600 hover:bg-amber-700 text-sm rounded font-bold scale-0"
        >
          Use External Wallet
        </button>
      </div>
    );
  } else {
    if (!minimized) {
      return (
        <div className="z-[1000] fixed top-4 left-4 h-52 w-64 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
          <div className="mt-4 ml-5 flex flex-col">
            <p className="text-xl mb-4 font-bold">Primodium</p>
            <button onClick={minimizeBox} className="fixed top-4 right-5">
              <LinkIcon icon={<FaMinusSquare size="18" />} />
            </button>
            <div className="flex items-center mb-2">
              <a
                href="https://tutorial.primodium.com"
                className="text-sm inline-block hover:text-gray-300"
              >
                <LinkIcon icon={<BsQuestionCircle size="16" />} />
                <p className="inline-block align-middle ml-2">How to play</p>
              </a>
            </div>
            <div className="flex items-center mb-2">
              <a
                href="https://twitter.com/primodiumgame"
                className="text-sm inline-block hover:text-gray-300"
              >
                <LinkIcon icon={<ImTwitter size="16" />} />
                <p className="inline-block align-middle ml-2">Twitter</p>
              </a>
            </div>
            <div className="flex items-center mb-2">
              <a
                href="https://discord.com/invite/bn7eSSKFWV"
                className="text-sm inline-block hover:text-gray-300"
              >
                <LinkIcon icon={<FaDiscord size="16" />} />
                <p className="inline-block align-middle ml-2">Discord</p>
              </a>
            </div>
            <button
              onClick={handleWalletLogout}
              className="absolute inset-x-4 bottom-4 h-10 bg-gray-500 hover:bg-gray-600 text-sm rounded font-bold"
            >
              {address ? address.substring(0, 12) + "..." : "error"}
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="z-[1000] fixed top-4 left-4 h-28 w-64 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
          <div className="mt-4 ml-5 flex flex-col">
            <p className="text-xl mb-4 font-bold">Primodium</p>
            <button onClick={minimizeBox} className="fixed top-4 right-5">
              <LinkIcon icon={<FaPlusSquare size="18" />} />
            </button>
            <button
              onClick={handleWalletLogout}
              className="absolute inset-x-4 bottom-4 h-10 bg-gray-500 hover:bg-gray-600 text-sm rounded font-bold"
            >
              {address ? address.substring(0, 12) + "..." : "error"}
            </button>
          </div>
        </div>
      );
    }
  }
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block align-middle my-auto">{icon}</div>
);

export default InfoBox;
