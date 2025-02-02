import { Hex, hexToString } from "viem";

import { Entity } from "@primodiumxyz/reactive-tables";
import { Tables } from "@/lib/types";
import { censorText } from "@/utils/global/profanity";

export const createAllianceUtils = (tables: Tables) => {
  /**
   * Gets alliance name from alliance entity
   *
   * @param alliance Alliance entity
   * @param censor Don't show inappropriate words
   * @returns Alliance name
   */
  const getAllianceName = (alliance: Entity, censor = false): string => {
    const allianceData = tables.Alliance.get(alliance);
    if (!allianceData) return "";

    const allianceName = hexToString(allianceData.name as Hex, { size: 32 });

    return censor ? censorText(allianceName) : allianceName;
  };

  /**
   * Get alliance name from player
   *
   * @param player Player entity
   * @param censor Don't show inappropriate words
   * @returns Alliance name
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
   *
   * @param allianceName Encoded name of alliance
   * @param censor Don't show inappropriate words
   * @returns Alliance name
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
