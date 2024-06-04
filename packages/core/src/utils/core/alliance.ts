import { hexToString, Hex } from "viem";
import { Entity } from "@latticexyz/recs";
import { censorText } from "@/utils/global/profanity";
import { Components } from "@/types";

export const createAllianceUtils = (components: Components) => {
  const getAllianceName = (alliance: Entity, censor = false) => {
    const allianceData = components.Alliance.get(alliance);
    if (!allianceData) return "";

    const allianceName = hexToString(allianceData.name as Hex, { size: 32 });

    return censor ? censorText(allianceName) : allianceName;
  };

  const getAllianceNameFromPlayer = (player: Entity, censor = false) => {
    const alliance = components.PlayerAlliance.get(player)?.alliance as Entity;
    const allianceData = components.Alliance.get(alliance);
    if (!allianceData) return "";

    const allianceName = hexToString(allianceData!.name as Hex, { size: 32 });
    return censor ? censorText(allianceName) : allianceName;
  };

  const decodeAllianceName = (allianceName: string, censor = false) => {
    const decoded = hexToString(allianceName as Hex, { size: 32 });
    return censor ? censorText(decoded) : decoded;
  };

  return {
    getAllianceName,
    getAllianceNameFromPlayer,
    decodeAllianceName,
  };
};
