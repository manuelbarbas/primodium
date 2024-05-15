import { Button } from "@/components/core/Button";
import { GlassCard } from "@/components/core/Card";
import { useMud } from "@/hooks";
import { components } from "@/network/components";
import { ObjectiveEntityLookup } from "@/util/constants";
import { makeObjectiveClaimable } from "@/util/objectives/makeObjectiveClaimable";
import { EObjectives } from "contracts/config/enums";
import { FaDiscord, FaTwitter } from "react-icons/fa6";
import { Hex } from "viem";

export const FollowSocials = () => {
  const playerEntity = useMud().playerAccount.entity;
  const twitterFollowed = !!components.CompletedObjective.useWithKeys({
    entity: playerEntity as Hex,
    objective: ObjectiveEntityLookup[EObjectives.FollowTwitter] as Hex,
  })?.value;
  const discordFollowed = !!components.CompletedObjective.useWithKeys({
    entity: playerEntity as Hex,
    objective: ObjectiveEntityLookup[EObjectives.JoinDiscord] as Hex,
  })?.value;

  const handleTwitterClick = () => {
    window.open("https://twitter.com/intent/follow?screen_name=primodiumgame", "_blank");
    makeObjectiveClaimable(playerEntity, EObjectives.FollowTwitter);
  };

  const handleDiscordClick = () => {
    window.open("https://discord.gg/primodium", "_blank");
    makeObjectiveClaimable(playerEntity, EObjectives.JoinDiscord);
  };

  if (twitterFollowed && discordFollowed) return null;
  return (
    <div className="flex flex-row gap-2 ml-4 z-10 pointer-events-auto">
      {!twitterFollowed && (
        <GlassCard direction="top" className="p-2">
          <Button
            tooltip="Follow our Twitter"
            variant="ghost"
            size="md"
            className="h-16 w-16 hover:scale-105"
            onClick={handleTwitterClick}
          >
            <FaTwitter className="w-10 h-10" />
          </Button>
        </GlassCard>
      )}
      {!discordFollowed && (
        <GlassCard direction="top" className="p-2">
          <Button
            variant="ghost"
            size="md"
            tooltip="Join our Discord"
            className="rounded-t-lg h-16 w-16 hover:scale-105"
            onClick={handleDiscordClick}
          >
            <FaDiscord className="w-10 h-10" />
          </Button>
        </GlassCard>
      )}
    </div>
  );
};
