import { hexToString, Hex } from "viem";
import { Entity } from "@latticexyz/recs";
import { censorText } from "@/utils/global/profanity";
import { Tables } from "@/lib/types";

export const createAllianceUtils = (tables: Tables) => {
  const getAllianceName = (alliance: Entity, censor = false) => {
    const allianceData = tables.Alliance.get(alliance);
    if (!allianceData) return "";

    const allianceName = hexToString(allianceData.name as Hex, { size: 32 });

    return censor ? censorText(allianceName) : allianceName;
  };

  const getAllianceNameFromPlayer = (player: Entity, censor = false) => {
    const alliance = tables.PlayerAlliance.get(player)?.alliance as Entity;
    const allianceData = tables.Alliance.get(alliance);
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
