import { ReactNode, useState } from "react";
import { FaDiscord, FaExclamationTriangle } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { toast } from "react-toastify";

import { Button } from "@/components/core/Button";
import { Navigator } from "@/components/core/Navigator";
import { useContractCalls } from "@/hooks/useContractCalls";

import { AccountSettings } from "./AccountSettings";
import { AudioSettings } from "./AudioSettings";
import { GeneralSettings } from "./GeneralSettings";

const params = new URLSearchParams(window.location.search);

export const Settings = () => {
  const [showingToast, setShowingToast] = useState(false);
  const { forfeit } = useContractCalls();

  const forfeitGame = async () => {
    toast.dismiss();
    if (showingToast) await new Promise((resolve) => setTimeout(resolve, 500));
    setShowingToast(true);
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col text-center justify-center items-center gap-2 w-full">
            <FaExclamationTriangle size={24} className="text-warning" />
            Are you sure you want to forfeit? You will lose all of your asteroids and fleets!
          </div>

          <div className="flex justify-center w-full gap-2">
            <button
              className="btn btn-secondary btn-xs"
              onClick={() => {
                forfeit();
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
        // className: "border-error",
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        hideProgressBar: true,
      },
    );
  };
  return (
    <Navigator initialScreen="main" className="flex flex-col items-center gap-2 text-white w-full h-full border-0 p-0">
      <Navigator.Screen title="main">
        <h1 className="inline-block align-middle text-xl font-bold">
          Primodium {params.get("version") ? params.get("version") : ""}
        </h1>

        <hr className="border border-cyan-600/50 w-full" />

        <div className="flex flex-col items-center space-y-3 my-3">
          <Button
            className="btn-md btn-secondary border-accent"
            onClick={() => {
              window.open("https://developer.primodium.com/game-guide", "_blank", "noopener noreferrer");
            }}
          >
            Game Guide
          </Button>
          <Navigator.NavButton to="general" className="btn-sm btn-seconday border-secondary w-28">
            General
          </Navigator.NavButton>
          <Navigator.NavButton to="audio" className="btn-sm btn-seconday border-secondary w-28">
            Audio
          </Navigator.NavButton>
          <Navigator.NavButton to="account" className="btn-sm btn-seconday border-secondary w-28">
            Account
          </Navigator.NavButton>
          <Button variant="error" onClick={forfeitGame} className="btn-sm btn-error w-28">
            forfeit
          </Button>
        </div>

        <div className="space-x-4 mt-4">
          <a
            href="https://discord.com/invite/bn7eSSKFWV"
            target="_blank"
            className="text-sm inline-block hover:text-gray-300"
            rel="noreferrer"
          >
            <LinkIcon icon={<FaDiscord size="24" />} />
          </a>
          <a
            href="https://twitter.com/primodiumgame"
            target="_blank"
            className="text-sm inline-block hover:text-gray-300"
            rel="noreferrer"
          >
            <LinkIcon icon={<FaXTwitter size="24" />} />
          </a>
        </div>
      </Navigator.Screen>

      <AudioSettings />
      <GeneralSettings />
      <AccountSettings />
    </Navigator>
  );
};

const LinkIcon = ({ icon }: { icon: ReactNode }) => (
  <div className="link-icon inline-block align-middle my-auto">{icon}</div>
);
