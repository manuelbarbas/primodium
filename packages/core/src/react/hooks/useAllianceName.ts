import { useMemo } from "react";
import { Hex, hexToString } from "viem";

import { Entity } from "@primodiumxyz/reactive-tables";
import { useCore } from "@/react/hooks/useCore";
import { censorText } from "@/utils/global/profanity";

/**
 * Custom hook that returns the name of an alliance.
 *
 * @param alliance - The alliance entity.
 * @param censor - Whether to censor the alliance name or not. Default is `false`.
 * @returns The name of the alliance.
 */
export const useAllianceName = (alliance: Entity, censor = false) => {
  const { tables } = useCore();
  const allianceData = tables.Alliance.use(alliance);
  return useMemo(() => {
    if (!allianceData) return "";

    const allianceName = hexToString(allianceData.name as Hex, { size: 32 });

    return censor ? censorText(allianceName) : allianceName;
  }, [allianceData, censor]);
};
