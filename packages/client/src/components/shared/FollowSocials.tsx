import { Button } from "@/components/core/Button";
import { useMud } from "@/hooks";
import { makeObjectiveClaimable } from "@/util/objectives/makeObjectiveClaimable";
import { EObjectives } from "contracts/config/enums";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";

export const FollowSocials = () => {
  const playerEntity = useMud().playerAccount.entity;
  const handleTwitterClick = () => {
    window.open("https://twitter.com/intent/follow?screen_name=primodiumgame", "_blank");
    makeObjectiveClaimable(playerEntity, EObjectives.FollowTwitter);
  };

  const handleDiscordClick = () => {
    window.open("https://discord.gg/primodium", "_blank");
    makeObjectiveClaimable(playerEntity, EObjectives.JoinDiscord);
  };

  return (
    <div className="flex flex-row gap-2 ml-2 z-10 pointer-events-auto">
      <Button
        tooltip="Follow&nbsp;our&nbsp;Twitter"
        tooltipDirection="topRight"
        variant="ghost"
        size="sm"
        className="h-12 w-12 hover:scale-105 rounded-tl-xl rounded-tr-xl"
        motion="disabled"
        onClick={handleTwitterClick}
      >
        <FaXTwitter className="w-6 h-6" />
      </Button>
      <Button
        tooltip="Join&nbsp;our&nbsp;Discord"
        tooltipDirection="topRight"
        variant="ghost"
        size="sm"
        className="h-12 w-12 hover:scale-105 rounded-tl-xl rounded-tr-xl"
        motion="disabled"
        onClick={handleDiscordClick}
      >
        <FaDiscord className="w-6 h-6" />
      </Button>
    </div>
  );
};
