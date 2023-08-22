import { FaDiscord, FaTwitter } from "react-icons/fa";
import { GameButton } from "../shared/GameButton";

const params = new URLSearchParams(window.location.search);

export const MainMenu = () => {
  return (
    <div className="flex flex-col items-center gap-2 text-white w-80 min-w-full">
      <h1 className="inline-block align-middle text-xl font-bold">
        Primodium {params.get("version") ? params.get("version") : ""}
      </h1>

      <hr className="border border-cyan-600/50 w-full" />

      <div className="space-y-3 my-3">
        <div className="relative">
          <GameButton
            id="game-guide"
            className="text-lg font-bold w-44"
            depth={5}
          >
            <a
              href="https://tutorial.primodium.com"
              target="_blank"
              rel="noreferrer"
              className="w-full h-full"
            >
              Game Guide
            </a>
          </GameButton>
        </div>
        <div className="relative">
          <GameButton
            id="keybinds"
            className="text-lg w-44"
            depth={5}
            color="bg-gray-700"
            disable
          >
            <div className="font-bold leading-none h-8 flex justify-center items-center crt px-2">
              Keybinds
            </div>
          </GameButton>
        </div>
        <div className="relative">
          <GameButton
            id="audio"
            className="text-lg w-44"
            depth={5}
            color="bg-gray-700"
            disable
          >
            <div className="font-bold leading-none h-8 flex justify-center items-center crt px-2">
              Audio
            </div>
          </GameButton>
        </div>
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
    </div>
  );
};

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block align-middle my-auto">{icon}</div>
);
