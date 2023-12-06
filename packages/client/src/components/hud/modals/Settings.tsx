import { FaDiscord, FaTwitter } from "react-icons/fa";
import { Button } from "src/components/core/Button";

const params = new URLSearchParams(window.location.search);

export const Settings = () => {
  return (
    <div className="flex flex-col items-center gap-2 text-white w-full h-full">
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
        <Button className="btn-md btn-secondary" disabled>
          Keybinds
        </Button>
        <Button className="btn-md btn-seconday" disabled>
          Audio
        </Button>
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

const LinkIcon = ({ icon }: { icon: any }) => <div className="link-icon inline-block align-middle my-auto">{icon}</div>;
