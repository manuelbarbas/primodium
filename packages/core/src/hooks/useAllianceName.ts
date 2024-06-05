import { censorText } from "@/utils/global/profanity";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";
import { Hex, hexToString } from "viem";

export const useAllianceName = (alliance: Entity, censor = false) => {
  const { components } = useCore();
  const allianceData = components.Alliance.use(alliance);
  return useMemo(() => {
    if (!allianceData) return "";

    const allianceName = hexToString(allianceData.name as Hex, { size: 32 });

    return censor ? censorText(allianceName) : allianceName;
  }, [allianceData, censor]);
};
