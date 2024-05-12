import { censorText } from "@/util/profanity";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { Hex, hexToString } from "viem";

export const useAllianceName = (alliance: Entity, censor = false) => {
  const allianceData = components.Alliance.use(alliance);
  return useMemo(() => {
    if (!allianceData) return "";

    const allianceName = hexToString(allianceData.name as Hex, { size: 32 });

    return censor ? censorText(allianceName) : allianceName;
  }, [allianceData, censor]);
};
