import { ReactNode } from "react";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { Navigator } from "src/components/core/Navigator";
import { AudioSettings } from "./AudioSettings";

const params = new URLSearchParams(window.location.search);

export const Settings = () => {
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
              window.open("https://tutorial.primodium.com", "_blank", "noopener noreferrer");
            }}
          >
            Game Guide
          </Button>
          <Navigator.NavButton to="audio" className="btn-md btn-seconday border-secondary">
            Audio
          </Navigator.NavButton>
          <Navigator.NavButton to="keybinds" className="btn-md btn-secondary" disabled>
            Keybinds
          </Navigator.NavButton>
        </div>

        <div className="space-x-4">
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
            <LinkIcon icon={<FaTwitter size="24" />} />
          </a>
        </div>
      </Navigator.Screen>

      <AudioSettings />
    </Navigator>
  );
};

const LinkIcon = ({ icon }: { icon: ReactNode }) => (
  <div className="link-icon inline-block align-middle my-auto">{icon}</div>
);
