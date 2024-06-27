import { hexToString, Hex } from "viem";
import { Entity } from "@primodiumxyz/reactive-tables";
import { censorText } from "@/utils/global/profanity";
import { Tables } from "@/lib/types";

export const createAllianceUtils = (tables: Tables) => {
  /**
   * gets alliance name from alliance entity
   * @param alliance alliance entity
   * @param censor don't show inappropriate words
   * @returns alliance name
   */
  const getAllianceName = (alliance: Entity, censor = false): string => {
    const allianceData = tables.Alliance.get(alliance);
    if (!allianceData) return "";

    const allianceName = hexToString(allianceData.name as Hex, { size: 32 });

    return censor ? censorText(allianceName) : allianceName;
  };

  /**
   * Get alliance name from player
   * @param player player entity
   * @param censor don't show inappropriate words
   * @returns alliance name
   */

  const getAllianceNameFromPlayer = (player: Entity, censor = false): string => {
    const alliance = tables.PlayerAlliance.get(player)?.alliance as Entity;
    const allianceData = tables.Alliance.get(alliance);
    if (!allianceData) return "";

    const allianceName = hexToString(allianceData!.name as Hex, { size: 32 });
    return censor ? censorText(allianceName) : allianceName;
  };

  /**
   * Decode raw alliance name from contracts
   * @param allianceName encoded name of alliance
   * @param censor don't show inappropriate words
   * @returns alliance name
   */
  const decodeAllianceName = (allianceName: string, censor = false): string => {
    const decoded = hexToString(allianceName as Hex, { size: 32 });
    return censor ? censorText(decoded) : decoded;
  };

  return {
    getAllianceName,
    getAllianceNameFromPlayer,
    decodeAllianceName,
  };
};
